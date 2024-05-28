use super::{super::challenge_rate_limit::RateLimit, vendors::SmsVendorKind};
use crate::{
    errors::{user::UserError, ApiError, ApiResult, AssertionError},
    utils::sms::vendors::SmsSendStatus,
    State,
};
use aws_credential_types::provider::SharedCredentialsProvider;
use chrono::Duration;
use crypto::sha256;
use db::models::tenant::Tenant;
use feature_flag::{BoolFlag, FeatureFlagClient, JsonFlag};
use itertools::Itertools;
use newtypes::{
    output::Csv,
    sms_message::{SmsMessage, SmsMessageKind},
    PhoneNumber, PiiString, SandboxId, VaultId,
};
use std::{fmt::Debug, sync::Arc};
use tokio::sync::oneshot::{self, Receiver, Sender};
use tracing::Instrument;
use twilio::TwilioConfig;

pub type SecondsBeforeRetry = Duration;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneEmailChallengeState {
    pub vault_id: VaultId,
    pub h_code: Vec<u8>,
}

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
    ) -> ApiResult<Self> {
        let twilio_client = twilio
            .make_client()
            .ok_or(AssertionError("Unable to make twilio client"))?;
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

    #[tracing::instrument("SmsClient::send_message", skip_all)]
    /// Rate limits sending messages to the destination phone number and then spawns an async task
    /// to send the message
    pub async fn send_message(
        &self,
        state: &State,
        message: SmsMessage,
        destination: PhoneNumber,
    ) -> ApiResult<()> {
        if destination.is_fixture_phone_number() {
            // Don't rate limit or send SMS messages to the fixture phone number
            tracing::info!("Fixture phone number. Not sending SMS");
            return Ok(());
        }
        RateLimit {
            key: &destination.e164(),
            period: self.duration_between_challenges,
            scope: message.rate_limit_scope(),
        }
        .enforce_and_update(state)
        .await?;
        self._send_message(message, destination, None).await?;
        Ok(())
    }

    #[tracing::instrument("SmsClient::send_message_non_blocking", skip_all)]
    async fn send_message_non_blocking(
        &self,
        state: &State,
        message: SmsMessage,
        destination: PhoneNumber,
        tx: Sender<ApiError>,
    ) -> ApiResult<()> {
        if destination.is_fixture_phone_number() {
            // Don't rate limit or send SMS messages to the fixture phone number
            return Ok(());
        }
        RateLimit {
            key: &destination.e164(),
            period: self.duration_between_challenges,
            scope: message.rate_limit_scope(),
        }
        .enforce_and_update(state)
        .await?;
        let client = self.clone();
        let fut = async move {
            let res = client._send_message(message, destination, Some(tx)).await;
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
        mut tx: Option<Sender<ApiError>>,
    ) -> ApiResult<()> {
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
            return AssertionError("No OTP vendors available").into();
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
            let e = match vendor.send(self, &message, &destination.e164()).await {
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

impl SmsClient {
    #[tracing::instrument(skip_all)]
    pub async fn send_challenge_non_blocking(
        &self,
        state: &State,
        tenant: Option<&Tenant>,
        destination: PhoneNumber,
        vault_id: VaultId,
        sandbox_id: Option<SandboxId>,
    ) -> ApiResult<(Receiver<ApiError>, PhoneEmailChallengeState, SecondsBeforeRetry)> {
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
        self.send_message_non_blocking(state, message, destination, tx)
            .await?;

        let state = PhoneEmailChallengeState { vault_id, h_code };
        Ok((rx, state, self.duration_between_challenges))
    }
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
pub async fn rx_background_error(rx: Receiver<ApiError>, timeout_s: u64) -> ApiResult<()> {
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
