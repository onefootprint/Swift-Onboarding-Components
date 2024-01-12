use aws_credential_types::provider::SharedCredentialsProvider;
use std::fmt::Debug;
use tokio::sync::oneshot::{self, Receiver, Sender};
use tracing::Instrument;

use crate::{
    errors::{user::UserError, ApiError, ApiResult, AssertionError},
    State,
};
use async_trait::async_trait;
use chrono::Duration;
use crypto::sha256;
use db::models::tenant::Tenant;
use feature_flag::{BoolFlag, FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use itertools::Itertools;
use newtypes::SandboxId;
use newtypes::{Base64Data, PhoneNumber, PiiString, VaultId};

use super::challenge_rate_limit::RateLimit;

pub type SecondsBeforeRetry = Duration;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneEmailChallengeState {
    pub vault_id: VaultId,
    pub h_code: Vec<u8>,
}

#[derive(Clone)]
pub struct SmsClient {
    duration_between_challenges: Duration,
    /// Twilio client
    pub twilio_client: twilio::Client,
    /// In prod, we still load the dev twilio account's credentials in case we need to quickly fall
    /// back for errors on the prod account.
    pub twilio_client_backup: Option<twilio::Client>,
    /// AWS pinpoint SMS client
    pinpoint_client: aws_sdk_pinpointsmsvoicev2::Client,
    ff_client: LaunchDarklyFeatureFlagClient,
}

#[derive(Debug, Eq, PartialEq)]
enum SmsVendorKind {
    Twilio,
    Pinpoint,
}

#[derive(Clone, Copy)]
struct Message<'a> {
    message: &'a PiiString,
    destination: &'a PiiString,
    client: &'a SmsClient,
}

#[derive(derive_more::Deref)]
struct Twilio<'a>(#[deref] Message<'a>);

#[derive(derive_more::Deref)]
struct Pinpoint<'a>(#[deref] Message<'a>);

#[async_trait]
trait SmsVendor: Send + Sync {
    async fn send(&self) -> ApiResult<()>;
    fn vendor(&self) -> SmsVendorKind;
}

#[async_trait]
impl<'a> SmsVendor for Twilio<'a> {
    #[tracing::instrument("Twilio::send", skip_all)]
    async fn send(&self) -> ApiResult<()> {
        // Don't want to send raw phone number to twilio
        let h_destination =
            Base64Data::into_string_standard(sha256(self.destination.leak().as_bytes()).to_vec()).0;
        let flag = BoolFlag::UseBackupTwilioCredentials(&h_destination);
        let use_backup_twilio = self.client.ff_client.flag(flag);
        tracing::info!(%use_backup_twilio, %h_destination, has_backup=%self.client.twilio_client_backup.is_some(), "Choosing twilio client");
        let twilio_client = match (use_backup_twilio, self.client.twilio_client_backup.as_ref()) {
            (true, Some(backup_client)) => backup_client,
            _ => &self.client.twilio_client,
        };

        twilio_client
            .send_message(self.destination.clone(), self.message.clone())
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Twilio
    }
}

#[async_trait]
impl<'a> SmsVendor for Pinpoint<'a> {
    #[tracing::instrument("Pinpoint::send", skip_all)]
    async fn send(&self) -> ApiResult<()> {
        self
            .0
            .client
            .pinpoint_client
            .send_text_message()
            // TODO change number based on environment
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(self.destination.leak_to_string())
            .message_body(self.message.leak_to_string())
            .send()
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Pinpoint
    }
}

pub struct TwilioConfig {
    pub account_sid: String,
    pub api_key: String,
    pub api_secret: String,
    pub source_phone_number: String,
}

impl TwilioConfig {
    fn make_client(self) -> Option<twilio::Client> {
        let Self {
            account_sid,
            api_key,
            api_secret,
            source_phone_number,
        } = self;
        if account_sid.is_empty()
            || api_key.is_empty()
            || api_secret.is_empty()
            || source_phone_number.is_empty()
        {
            return None;
        }
        let client = twilio::Client::new(account_sid, api_key, api_secret, source_phone_number);
        Some(client)
    }
}

impl SmsClient {
    pub fn new(
        twilio: TwilioConfig,
        twilio_backup: TwilioConfig,
        time_s_between_challenges: i64,
        ff_client: LaunchDarklyFeatureFlagClient,
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

    #[tracing::instrument("SmsClient::send_message", skip_all)]
    /// Rate limits sending messages to the destination phone number and then spawns an async task
    /// to send the message_body
    pub async fn send_message(
        &self,
        state: &State,
        message_body: PiiString,
        destination: &PhoneNumber,
        rate_limit_scope: &str,
    ) -> ApiResult<()> {
        if destination.is_fixture_phone_number() {
            // Don't rate limit or send SMS messages to the fixture phone number
            return Ok(());
        }
        RateLimit {
            key: &destination.e164(),
            period: self.duration_between_challenges,
            scope: rate_limit_scope,
        }
        .enforce_and_update(state)
        .await?;
        let message_body = PiiString::from(format!("{}\n\nSent via Footprint", message_body.leak()));
        self._send_message(message_body, destination.e164(), None).await?;
        Ok(())
    }

    #[tracing::instrument("SmsClient::send_message_non_blocking", skip_all)]
    async fn send_message_non_blocking(
        &self,
        state: &State,
        message_body: PiiString,
        destination: &PhoneNumber,
        rate_limit_scope: &str,
        tx: Sender<ApiError>,
    ) -> ApiResult<()> {
        if destination.is_fixture_phone_number() {
            // Don't rate limit or send SMS messages to the fixture phone number
            return Ok(());
        }
        RateLimit {
            key: &destination.e164(),
            period: self.duration_between_challenges,
            scope: rate_limit_scope,
        }
        .enforce_and_update(state)
        .await?;
        let message_body = PiiString::from(format!("{}\n\nSent via Footprint", message_body.leak()));
        let e164 = destination.e164();
        let client = self.clone();
        let fut = async move {
            let res = client._send_message(message_body, e164, Some(tx)).await;
            if let Err(err) = res {
                tracing::error!(%err, "Couldn't send SMS asynchronously");
            }
        };
        tokio::spawn(fut.in_current_span());
        Ok(())
    }

    /// Sends the message_body to the provided destination, choosing which vendor to use if any
    #[tracing::instrument("SmsClient::_send_message", skip_all)]
    async fn _send_message(
        &self,
        message_body: PiiString,
        destination: PiiString,
        mut tx: Option<Sender<ApiError>>,
    ) -> ApiResult<()> {
        let message = Message {
            client: self,
            message: &message_body,
            destination: &destination,
        };
        let vendors: Vec<Box<dyn SmsVendor>> = vec![
            // Two twilios because we want to try twilio twice before falling back to pinpoint
            Box::new(Twilio(message)),
            Box::new(Twilio(message)),
            Box::new(Pinpoint(message)),
        ];
        let preferred_vendor = if self.ff_client.flag(BoolFlag::TwilioIsPreferredSmsVendor) {
            SmsVendorKind::Twilio
        } else {
            SmsVendorKind::Pinpoint
        };
        let ordered_vendors = vendors
            .into_iter()
            // The clients matching the preferred vendor will be put at the top of the list
            .sorted_by_key(|v| v.vendor() != preferred_vendor)
            .collect_vec();

        // Iterate through vendors in the order of preference, trying each one until we get a
        // successful response or reach the end of our vendors
        let mut err = None;
        let mut sent_error_to_caller = false;
        for vendor in ordered_vendors {
            let e = match vendor.send().await {
                Ok(_) => return Ok(()),
                Err(e) => e,
            };
            tracing::warn!(?preferred_vendor, err=%e, err_debug=?e, "Moving on to next SMS vendor");
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
            }
        }
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
        destination: &PhoneNumber,
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
            "000000".to_owned()
        } else {
            crypto::random::gen_rand_n_digit_code(6)
        };
        let message_body = if let Some(tenant) = tenant {
            PiiString::from(format!("Your {} verification code is {}. Don't share your code with anyone, we will never contact you to request this code.", tenant.name, &code))
        } else {
            // This copy likely won't work for safari's autofill, but the other one is being blocked by twilio
            PiiString::from(format!("Your Footprint verification code is {}. Don't share your code with anyone, we will never contact you to request this code.", &code))
        };

        // Oneshot channel to send an error back from async message sending
        let (tx, rx) = oneshot::channel();

        self.send_message_non_blocking(state, message_body, destination, RateLimit::SMS_CHALLENGE, tx)
            .await?;

        let state = PhoneEmailChallengeState {
            vault_id,
            h_code: sha256(code.as_bytes()).to_vec(),
        };
        Ok((rx, state, self.duration_between_challenges))
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_d2p(
        &self,
        state: &State,
        destination: &PhoneNumber,
        url: String,
    ) -> ApiResult<SecondsBeforeRetry> {
        let message_body = PiiString::from(format!(
            "Continue account verification on your phone using this link: {}",
            url
        ));

        self.send_message(state, message_body, destination, RateLimit::D2P_LINK)
            .await?;

        Ok(self.duration_between_challenges)
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_bo_session<'a>(&self, state: &State, info: BoSessionSmsInfo<'a>) -> ApiResult<()> {
        let message_body = PiiString::from(format!(
            "{} identified you as a beneficial owner of {}. To finish verifying your business for {}, we need to verify your identity as well. Continue here: {}",
            info.inviter.leak(),
            info.business_name.leak(),
            info.org_name,
            info.url.leak()
        ));

        self.send_message(state, message_body, info.destination, RateLimit::BO_SESSION)
            .await?;

        Ok(())
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
