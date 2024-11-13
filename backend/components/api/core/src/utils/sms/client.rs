use super::super::challenge_rate_limit::RateLimit;
use super::vendors::SmsVendorKind;
use crate::errors::user::UserError;
use crate::utils::sms::vendors::SmsSendStatus;
use crate::FpResult;
use crate::State;
use api_errors::BadRequestInto;
use api_errors::FpError;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use aws_credential_types::provider::SharedCredentialsProvider;
use chrono::Duration;
use crypto::sha256;
use db::models::tenant::Tenant;
use db::DbPool;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use feature_flag::JsonFlag;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::sms_message::SmsMessage;
use newtypes::sms_message::SmsMessageKind;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::TenantId;
use newtypes::VaultId;
use std::sync::Arc;
use tokio::sync::oneshot;
use tokio::sync::oneshot::Receiver;
use tokio::sync::oneshot::Sender;
use tracing::Instrument;
use twilio::TwilioConfig;

pub type SecondsBeforeRetry = Duration;

#[derive(Clone)]
pub struct SmsClient {
    pub duration_between_challenges: Duration,
    /// Twilio client
    pub twilio_client: twilio::Client,
    /// In prod, we still load the dev twilio account's credentials in case we need to quickly fall
    /// back for errors on the prod account.
    pub twilio_client_backup: Option<twilio::Client>,
    /// AWS pinpoint SMS client
    pub(super) pinpoint_client: aws_sdk_pinpointsmsvoicev2::Client,
    pub(super) ff_client: Arc<dyn FeatureFlagClient>,
}

impl SmsClient {
    pub fn new(
        twilio: TwilioConfig,
        twilio_backup: TwilioConfig,
        time_s_between_challenges: i64,
        ff_client: Arc<dyn FeatureFlagClient>,
    ) -> FpResult<Self> {
        let twilio_client = twilio
            .make_client()
            .ok_or(ServerErr("Unable to make twilio client"))?;
        let twilio_client_backup = twilio_backup.make_client();
        // TODO stop hardcoding this
        // TODO also change the sending number based on environment
        let pinpoint_config = aws_config::SdkConfig::builder()
            .region(aws_types::region::Region::new("us-east-1"))
            .credentials_provider(SharedCredentialsProvider::new(
                aws_credential_types::Credentials::new(
                    "AKIA3U5XRCZONUEXET7L",
                    "RviyM0Yn3rYHnQK/mhC5Wb9DxWubx5rr1efqzB1p",
                    None,
                    None,
                    "pinpoint_static",
                ),
            ))
            .build();
        let pinpoint_client = aws_sdk_pinpointsmsvoicev2::Client::new(&pinpoint_config);
        let client = Self {
            duration_between_challenges: Duration::seconds(time_s_between_challenges),
            twilio_client,
            twilio_client_backup,
            pinpoint_client,
            ff_client,
        };
        Ok(client)
    }

    /// Via launch darkly flag, proxy between the twilio client and backup twilio client based
    /// on the recipient.
    /// We don't use the backup client - but in case there's a problem with the main account,
    /// we could quickly divert traffic to the fallback
    pub(super) fn twilio_client(&self, recipient_e164: &PiiString) -> &twilio::Client {
        let flag = BoolFlag::UseBackupTwilioCredentials(recipient_e164.leak());
        let use_backup_twilio = self.ff_client.flag(flag);
        tracing::info!(%use_backup_twilio, has_backup=%self.twilio_client_backup.is_some(), "Choosing twilio client");
        match (use_backup_twilio, self.twilio_client_backup.as_ref()) {
            (true, Some(backup_client)) => backup_client,
            _ => &self.twilio_client,
        }
    }

    /// Runs pre-validation for the message and returns whether the message should be sent.
    async fn should_send_message(
        &self,
        state: &State,
        message: &SmsMessage,
        destination: &PhoneNumber,
        t_id: Option<&TenantId>,
    ) -> FpResult<bool> {
        if destination.is_fixture_phone_number() {
            // Don't rate limit or send SMS messages to the fixture phone number
            tracing::info!("Fixture phone number. Not sending SMS");
            return Ok(false);
        }
        RateLimit {
            key: &destination.e164(),
            period: self.duration_between_challenges,
            scope: message.rate_limit_scope(),
        }
        .enforce_and_update(state)
        .await?;
        if destination.is_high_fraud_risk_country() {
            let Some(t_id) = t_id else {
                return BadRequestInto("Cannot send SMS to high-risk country");
            };
            if !state
                .ff_client
                .flag(BoolFlag::CanSendSmsToHighFraudCountries(t_id))
            {
                return BadRequestInto("Organization cannot send SMS to high-risk country");
            }
        }
        Ok(true)
    }

    #[tracing::instrument("SmsClient::send_message", skip_all)]
    pub async fn send_message(
        &self,
        state: &State,
        message: SmsMessage,
        destination: PhoneNumber,
        t_id: Option<&TenantId>,
        v_id: Option<&VaultId>,
    ) -> FpResult<()> {
        if !self
            .should_send_message(state, &message, &destination, t_id)
            .await?
        {
            return Ok(());
        }
        self._send_message(message, destination, t_id, v_id, &state.db_pool, None)
            .await?;
        Ok(())
    }

    #[tracing::instrument("SmsClient::send_message_non_blocking", skip_all)]
    async fn send_message_non_blocking(
        &self,
        state: &State,
        message: SmsMessage,
        destination: PhoneNumber,
        t_id: Option<TenantId>,
        v_id: Option<VaultId>,
        tx: Sender<FpError>,
    ) -> FpResult<()> {
        if !self
            .should_send_message(state, &message, &destination, t_id.as_ref())
            .await?
        {
            return Ok(());
        }
        let client = self.clone();
        let db_pool = state.db_pool.clone();

        let fut = async move {
            let t_id = t_id.as_ref();
            let res = client
                ._send_message(message, destination, t_id, v_id.as_ref(), &db_pool, Some(tx))
                .await;
            if let Err(err) = res {
                tracing::error!(%err, "Couldn't send SMS asynchronously");
            }
        };
        tokio::spawn(fut.in_current_span());
        Ok(())
    }

    /// Sends the message to the provided destination, choosing which vendor to use if any
    #[tracing::instrument("SmsClient::_send_message", skip_all)]
    async fn _send_message(
        &self,
        message: SmsMessage,
        destination: PhoneNumber,
        t_id: Option<&TenantId>,
        v_id: Option<&VaultId>,
        db_pool: &DbPool,
        mut tx: Option<Sender<FpError>>,
    ) -> FpResult<()> {
        let e164 = destination.e164();
        // Assemble the list of vendors we will use to attempt to send the message.
        // This launchdarkly flag controls both (1) which vendors are available and
        // (2) the priority of which to use first.
        // We can use this flag to quickly switch away from vendors who are misbehaving without a deploy
        let vendors: Result<Option<Vec<SmsVendorKind>>, _> = self
            .ff_client
            .json_flag(JsonFlag::AvailableOtpVendorPriorities(e164.leak()))
            .and_then(serde_json::value::from_value);
        let vendor_kinds = match vendors {
            Err(err) => {
                tracing::error!(
                    ?err,
                    "Can't deserialize OTP vendors. Falling back to SmsVendorKind::default_vendors()"
                );
                SmsVendorKind::default_vendors()
            }
            Ok(Some(vendors)) => vendors,
            Ok(None) => SmsVendorKind::default_vendors(),
        };
        tracing::info!(vendors=%Csv(vendor_kinds.clone()), "Selected SMS vendors");

        let vendors = vendor_kinds
            .iter()
            .filter(|v| match **v {
                SmsVendorKind::TwilioWhatsapp => {
                    // Try sending via whatsapp only if the message supports it and the user resides in a
                    // country that prefers whatsapp
                    let user_prefers_whatsapp = destination.prefers_whatsapp()
                        || self.ff_client.flag(BoolFlag::PreferWhatsapp(e164.leak()));
                    message.supports_whatsapp() && user_prefers_whatsapp
                }
                _ => true,
            })
            .collect_vec();
        if vendors.is_empty() {
            return ServerErrInto("No OTP vendors available");
        }

        let mut err = None;
        let mut sent_error_to_caller = false;
        let mut attempted_vendors = vec![];
        // Iterate through vendors in the order of preference, trying each one until we get a
        // successful response or reach the end of our vendors
        let mut vendors = vendors.into_iter();
        let is_success = loop {
            let Some(vendor_kind) = vendors.next() else {
                break false;
            };
            attempted_vendors.push(vendor_kind);

            // Send the message using this vendor
            let vendor = vendor_kind.vendor();
            let e = match vendor
                .send(self, &message, &destination.e164(), t_id, v_id, db_pool)
                .await
            {
                Ok(SmsSendStatus::Sent) => {
                    err = None;
                    break true;
                }
                Ok(SmsSendStatus::Unsent) => None,
                Err(e) => Some(e),
            };

            // Handle any error/fallback from the vendor
            tracing::warn!(vendors=%Csv(vendor_kinds.clone()), has_err=e.is_some(), err=?e.as_ref().map(|e| e.to_string()), err_debug=?e, "Moving on to next SMS vendor");
            let Some(e) = e else {
                // There's no error to return to the client but we still want to retry the next vendor
                continue;
            };
            err = if let Some(tx) = tx.take() {
                // After the first error is encountered, pass the error back on the channel in
                // case someone is listening
                // Don't raise error from sending since it's possible the receiver has hung up
                let r = tx.send(e);
                if r.is_ok() {
                    // Due to a race condition it's possible the error still isn't returned to the
                    // caller. But not super likely
                    sent_error_to_caller = true;
                    tracing::info!("Sent error to caller. But not necessarily return from API");
                }
                r.err()
            } else {
                // After the first error, just save the err in ram to raise after all vendors
                // have been tried
                Some(e)
            };
        };

        tracing::info!(attempted_vendors=%Csv(attempted_vendors), %is_success, message_kind=?SmsMessageKind::from(message), "SmsClient::_send result");
        if let Some(err) = err {
            if !sent_error_to_caller {
                // If the error was not sent to the caller, return it here.
                // If we're running in the foreground, we'll always raise an Err.
                return Err(err);
            }
        }
        Ok(())
    }
}

#[tracing::instrument(skip_all)]
pub async fn send_sms_challenge_non_blocking(
    state: &State,
    tenant: Option<&Tenant>,
    destination: PhoneNumber,
    sandbox_id: Option<SandboxId>,
    vault_id: Option<VaultId>,
) -> FpResult<(Receiver<FpError>, Vec<u8>)> {
    // Send non-blocking to prevent us from returning the challenge data to the frontend while
    // we wait for twilio latency
    if destination.is_fixture_phone_number() && sandbox_id.is_none() {
        return Err(UserError::FixtureCIInLive.into());
    }
    let code = if destination.is_fixture_phone_number() {
        // For our one fixture number in sandbox mode, we want the 2fac code to be fixed
        // to make it easy to test
        PiiString::from("000000")
    } else {
        PiiString::from(crypto::random::gen_rand_n_digit_code(6))
    };
    let h_code = sha256(code.leak().as_bytes()).to_vec();

    // Oneshot channel to send an error back from async message sending
    let (tx, rx) = oneshot::channel();

    let message = SmsMessage::Otp {
        tenant_name: tenant.map(|t| t.name.clone()),
        code,
    };
    let t_id = tenant.map(|t| t.id.clone());
    state
        .sms_client
        .send_message_non_blocking(state, message, destination, t_id, vault_id, tx)
        .await?;

    Ok((rx, h_code))
}

pub struct BoSessionSmsInfo<'a> {
    pub destination: &'a PhoneNumber,
    pub inviter: &'a PiiString,
    /// The name of the business being verified
    pub business_name: &'a PiiString,
    /// The tenant name
    pub org_name: &'a str,
    pub url: PiiString,
}

#[tracing::instrument(skip_all)]
/// Wait for the provided timeout_s to see if the background task asynchronously either
/// (1) completes or (2) sends us an error.
pub async fn rx_background_error(rx: Receiver<FpError>, timeout_s: u64) -> FpResult<()> {
    match tokio::time::timeout(std::time::Duration::from_secs(timeout_s), rx).await {
        Ok(Ok(err)) => {
            tracing::warn!(err=%err, "Error received");
            Err(err)
        }
        Ok(Err(_)) => {
            tracing::info!("Sender has been dropped. Message successfully sent");
            Ok(())
        }
        Err(_) => {
            // The timeout has been reached and we'll return a successful response assuming the
            // background task just continue successfully
            tracing::info!("Timeout reached without receiving an error");
            Ok(())
        }
    }
}
