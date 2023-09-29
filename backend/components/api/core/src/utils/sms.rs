use std::fmt::Debug;

use crate::{
    errors::{challenge::ChallengeError, user::UserError, ApiError, ApiResult},
    State,
};
use actix_web::http::StatusCode;
use chrono::{Duration, Utc};
use crypto::sha256;
use feature_flag::{BoolFlag, FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use newtypes::SandboxId;
use newtypes::{PhoneNumber, PiiString};
use thiserror::Error;

use self::rate_limit::RateLimit;

use super::session::{JsonSession, RateLimitRecord};

pub type SecondsBeforeRetry = Duration;

#[derive(Debug, Error)]
/// Our own wrapper around twilio errors to better display them
pub enum TwilioError {
    #[error("{0}")]
    Request(reqwest::Error),
    #[error("{0}")]
    RequestMiddleware(reqwest_middleware::Error),
    #[error("Delivery failed")]
    DeliveryFailed,
    #[error("Not delivered")]
    NotDelivered,
    #[error("{0}")]
    Api(twilio::error::ApiErrorResponse),
    #[error("{0}")]
    SerdeJson(serde_json::Error),
}

impl From<twilio::error::Error> for TwilioError {
    fn from(value: twilio::error::Error) -> Self {
        match value {
            twilio::error::Error::Request(e) => Self::Request(e),
            twilio::error::Error::ReqwestMiddleware(e) => Self::RequestMiddleware(e),
            twilio::error::Error::DeliveryFailed => Self::DeliveryFailed,
            twilio::error::Error::NotDelivered => Self::NotDelivered,
            twilio::error::Error::Api(e) => Self::Api(e),
            twilio::error::Error::SerdeJson(e) => Self::SerdeJson(e),
        }
    }
}

impl TwilioError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            Self::Request(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::RequestMiddleware(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::DeliveryFailed => StatusCode::INTERNAL_SERVER_ERROR,
            Self::NotDelivered => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Api(e) => match e.status {
                400 => StatusCode::BAD_REQUEST,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
            Self::SerdeJson(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[derive(Clone)]
pub struct SmsClient {
    duration_between_challenges: Duration,
    /// Twilio client
    pub twilio_client: twilio::Client,
    /// AWS pinpoint SMS client
    pinpoint_client: aws_sdk_pinpointsmsvoicev2::Client,
    ff_client: LaunchDarklyFeatureFlagClient,
}

impl SmsClient {
    pub fn new(
        account_sid: String,
        api_key: String,
        api_secret: String,
        source_phone_number: String,
        time_s_between_challenges: i64,
        ff_client: LaunchDarklyFeatureFlagClient,
    ) -> Self {
        let client = twilio::Client::new(account_sid, api_key, api_secret, source_phone_number);
        // TODO stop hardcoding this
        // TODO also change the sending number based on environment
        let pinpoint_config = aws_config::SdkConfig::builder()
            .region(aws_sdk_kms::Region::new("us-east-1"))
            .credentials_provider(aws_types::credentials::SharedCredentialsProvider::new(
                aws_sdk_kms::Credentials::new(
                    "AKIA3U5XRCZONUEXET7L",
                    "RviyM0Yn3rYHnQK/mhC5Wb9DxWubx5rr1efqzB1p",
                    None,
                    None,
                    "pinpoint_static",
                ),
            ))
            .build();
        let pinpoint_client = aws_sdk_pinpointsmsvoicev2::Client::new(&pinpoint_config);
        Self {
            duration_between_challenges: Duration::seconds(time_s_between_challenges),
            twilio_client: client,
            pinpoint_client,
            ff_client,
        }
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
            state,
            phone_number: destination,
            period: self.duration_between_challenges,
            scope: rate_limit_scope,
        }
        .enforce_and_update()
        .await?;
        let message_body = PiiString::from(format!("{}\n\nSent via Footprint", message_body.leak()));
        self._send_message(message_body, destination.e164()).await?;
        Ok(())
    }

    #[tracing::instrument("SmsClient::send_message_non_blocking", skip_all)]
    async fn send_message_non_blocking(
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
            state,
            phone_number: destination,
            period: self.duration_between_challenges,
            scope: rate_limit_scope,
        }
        .enforce_and_update()
        .await?;
        let message_body = PiiString::from(format!("{}\n\nSent via Footprint", message_body.leak()));
        let e164 = destination.e164();
        let client = self.clone();
        tokio::spawn(async move {
            let _ = client._send_message(message_body, e164).await.map_err(|err| {
                tracing::error!(error=?err, "Failed to send SMS message");
            });
        });
        Ok(())
    }

    /// Sends the message_body to the provided destination, choosing which vendor to use if any
    #[tracing::instrument("SmsClient::_send_message", skip_all)]
    async fn _send_message(&self, message_body: PiiString, destination: PiiString) -> ApiResult<()> {
        // TODO can clean this up a lot in the future
        let prefer_twilio = self.ff_client.flag(BoolFlag::TwilioIsPreferredSmsVendor);
        let res = if prefer_twilio {
            self._send_twilio(&message_body, &destination).await
        } else {
            self._send_pinpoint(&message_body, &destination).await
        };
        if let Err(e) = res {
            tracing::error!(prefer_twilio = prefer_twilio, e=%e, "Moving on to fallback SMS vendor");
            // If there was an error, waterfall to the secondary vendor
            if prefer_twilio {
                self._send_pinpoint(&message_body, &destination).await?;
            } else {
                self._send_twilio(&message_body, &destination).await?;
            };
        }
        Ok(())
    }

    #[tracing::instrument("SmsClient::_send_twilio", skip_all)]
    async fn _send_twilio(&self, message_body: &PiiString, destination: &PiiString) -> ApiResult<()> {
        self.twilio_client
            .send_message(destination.clone(), message_body.clone())
            .await
            .map_err(TwilioError::from)?;
        Ok(())
    }

    #[tracing::instrument("SmsClient::_send_pinpoint", skip_all)]
    async fn _send_pinpoint(&self, message_body: &PiiString, destination: &PiiString) -> ApiResult<()> {
        self
            .pinpoint_client
            .send_text_message()
            // TODO change number based on environment
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(destination.leak_to_string())
            .message_body(message_body.leak_to_string())
            .send()
            .await?;
        Ok(())
    }
}

impl SmsClient {
    #[tracing::instrument(skip_all)]
    pub async fn send_challenge_non_blocking(
        &self,
        state: &State,
        tenant_name: Option<String>,
        destination: &PhoneNumber,
        sandbox_id: Option<SandboxId>,
    ) -> ApiResult<(PhoneChallengeState, SecondsBeforeRetry)> {
        // Send non-blocking to prevent us from returning the challenge data to the frontend while
        // we wait for twilio latency
        if destination.is_fixture_phone_number() && sandbox_id.is_none() {
            return Err(UserError::FixtureNumberInLive.into());
        }
        let code = if destination.is_fixture_phone_number() {
            // For our one fixture number in sandbox mode, we want the 2fac code to be fixed
            // to make it easy to test
            "000000".to_owned()
        } else {
            crypto::random::gen_rand_n_digit_code(6)
        };
        let message_body = if let Some(tenant_name) = tenant_name {
            PiiString::from(format!("Your {} verification code is: {}. Don't share your code with anyone, we will never contact you to request this code.", tenant_name, &code))
        } else {
            PiiString::from(format!("Your Footprint verification code is: {}. Don't share your code with anyone, we will never contact you to request this code.", &code))
        };

        self.send_message_non_blocking(state, message_body, destination, rate_limit::SMS_CHALLENGE)
            .await?;

        Ok((
            PhoneChallengeState {
                phone_number: destination.e164(),
                sandbox_id,
                h_code: sha256(code.as_bytes()).to_vec(),
            },
            self.duration_between_challenges,
        ))
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_d2p(
        &self,
        state: &State,
        destination: &PhoneNumber,
        url: String,
    ) -> ApiResult<SecondsBeforeRetry> {
        let message_body = PiiString::from(format!("Continue account verification using this link: {}", url));

        self.send_message(state, message_body, destination, rate_limit::D2P_LINK)
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

        self.send_message(state, message_body, info.destination, rate_limit::BO_SESSION)
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

/// Phone number challenge in-progress state
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneChallengeState {
    pub phone_number: PiiString,
    pub sandbox_id: Option<SandboxId>,
    pub h_code: Vec<u8>,
}

pub mod rate_limit {
    use super::*;

    // TODO: probably just enum these dudes
    pub const BO_SESSION: &str = "bo_session";
    pub const DASHBOARD_TRIGGER: &str = "dashboard_trigger";
    pub const D2P_LINK: &str = "d2p_session";
    pub const SMS_CHALLENGE: &str = "sms_challenge";

    fn key(phone_number: &PhoneNumber, scope: &str) -> String {
        // Check SMS rate limits not including sandbox suffix to prevent spamming someone
        format!("{}:{}", phone_number.e164().leak(), scope)
    }

    pub(super) struct RateLimit<'a> {
        pub(super) state: &'a State,
        pub(super) period: Duration,
        pub(super) phone_number: &'a PhoneNumber,
        pub(super) scope: &'a str,
    }

    impl<'a> RateLimit<'a> {
        pub(super) async fn enforce_and_update(&self) -> Result<(), ApiError> {
            let RateLimit {
                state,
                period,
                phone_number,
                scope,
            } = *self;

            let rate_limit_key = key(phone_number, scope);
            let now = Utc::now();

            state
                .db_pool
                .db_query(move |conn| -> Result<_, ApiError> {
                    if let Some(session) = JsonSession::<RateLimitRecord>::get(conn, &rate_limit_key)? {
                        let time_since_last_sent = now - session.data.sent_at;
                        if time_since_last_sent < period {
                            // num_seconds() only returns count of whole seconds, so we add one to avoid returning 0 seconds as time remaining
                            let time_remaining = (period - time_since_last_sent).num_seconds() + 1;
                            return Err(ChallengeError::RateLimited(time_remaining).into());
                        }
                    }

                    let record = RateLimitRecord { sent_at: now };
                    JsonSession::update_or_create(conn, &rate_limit_key, &record, now + period)?;

                    Ok(())
                })
                .await??;

            Ok(())
        }
    }
}
