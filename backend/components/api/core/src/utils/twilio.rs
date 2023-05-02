use std::fmt::Debug;

use crate::{
    errors::{challenge::ChallengeError, ApiError, ApiResult},
    State,
};
use chrono::{Duration, Utc};
use crypto::sha256;
use newtypes::{PhoneNumber, PiiString};

use self::rate_limit::RateLimit;

use super::session::{JsonSession, RateLimitRecord};

pub type SecondsBeforeRetry = Duration;

#[derive(Debug, Clone)]
pub struct TwilioClient {
    pub duration_between_challenges: Duration,
    pub rp_id: String,
    pub client: twilio::Client,
}

impl TwilioClient {
    pub fn new(
        account_sid: String,
        api_key: String,
        api_secret: String,
        source_phone_number: String,
        time_s_between_challenges: i64,
        rp_id: String,
    ) -> Self {
        let client = twilio::Client::new(account_sid, api_key, api_secret, source_phone_number);
        Self {
            duration_between_challenges: Duration::seconds(time_s_between_challenges),
            rp_id,
            client,
        }
    }

    #[tracing::instrument(skip_all)]
    /// Rate limits sending messages to the destination phone number and then spawns an async task
    /// to send the message_body
    async fn send_message(
        &self,
        state: &State,
        message_body: String,
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
        // spawn this async so we return immediately
        let client = self.client.clone();
        let destination_clone = destination.clone();

        tokio::spawn(async move {
            let _ = client
                .send_message(destination_clone.e164().leak(), message_body)
                .await
                .map_err(|err| {
                    tracing::error!(error=?err, "twilio error");
                });
        });
        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_challenge(
        &self,
        state: &State,
        tenant_name: Option<String>,
        destination: &PhoneNumber,
    ) -> ApiResult<(PhoneChallengeState, SecondsBeforeRetry)> {
        let code = if destination.is_fixture_phone_number() {
            // For our one fixture number in sandbox mode, we want the 2fac code to be fixed
            // to make it easy to test
            "000000".to_owned()
        } else {
            crypto::random::gen_rand_n_digit_code(6)
        };
        let message_body = if let Some(tenant_name) = tenant_name {
            format!("Your {} verification code is: {}. Don't share your code with anyone, we will never contact you to request this code. Sent via Footprint.", tenant_name, &code)
        } else {
            format!("Your Footprint verification code is: {}. Don't share your code with anyone, we will never contact you to request this code. Sent via Footprint.", &code)
        };

        self.send_message(state, message_body, destination, rate_limit::SMS_CHALLENGE)
            .await?;

        Ok((
            PhoneChallengeState {
                phone_number_e164_with_suffix: destination.e164_with_suffix(),
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
        let message_body = format!(
            "Continue account verification using this link: {}. Sent via Footprint",
            url
        );

        self.send_message(state, message_body, destination, rate_limit::D2P_LINK)
            .await?;

        Ok(self.duration_between_challenges)
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_bo_session<'a>(&self, state: &State, info: BoSessionSmsInfo<'a>) -> ApiResult<()> {
        let message_body = format!(
            "To sign up for {}, {} is verifying {}, and you were identified as a beneficial owner. For it to be successfully verified, you need to verify your identity. Continue here: {}\n\nSent via Footprint",
            info.org_name,
            info.inviter.leak(),
            info.business_name.leak(),
            info.url.leak()
        );

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
    /// Will also include sandbox suffix, if exists
    pub phone_number_e164_with_suffix: PiiString,
    pub h_code: Vec<u8>,
}

mod rate_limit {
    use super::*;

    pub const BO_SESSION: &str = "bo_session";
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
