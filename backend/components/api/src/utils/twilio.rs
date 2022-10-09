use std::fmt::Debug;

use crate::{
    errors::{challenge::ChallengeError, ApiError},
    hosted::identify::PhoneChallengeState,
    State,
};
use chrono::{Duration, Utc};
use crypto::sha256;
use newtypes::{PhoneNumber, ValidatedPhoneNumber};

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

    pub async fn standardize(&self, phone_number: &PhoneNumber) -> Result<ValidatedPhoneNumber, ApiError> {
        let response = self.client.validate_phone_number(phone_number.leak()).await?;
        Ok(ValidatedPhoneNumber::__build(
            response.phone_number,
            response.country_code,
            phone_number.suffix.clone(),
        ))
    }

    pub async fn send_challenge(
        &self,
        state: &State,
        destination: &ValidatedPhoneNumber,
    ) -> Result<(PhoneChallengeState, SecondsBeforeRetry), ApiError> {
        let code = crypto::random::gen_rand_n_digit_code(6);
        let message_body = format!("Your {} verification code is {}. Don't share your code with anyone. We will never contact you to request this code.", &self.rp_id, &code);

        RateLimit {
            state,
            phone_number: destination,
            period: self.duration_between_challenges,
            scope: rate_limit::SMS_CHALLENGE,
        }
        .enforce_and_update()
        .await?;

        // spawn this async so we return immediately
        let client = self.client.clone();
        let destination_clone = destination.clone();

        tokio::spawn(async move {
            let _ = client
                .clone()
                .send_message(destination_clone.e164.leak(), message_body)
                .await
                .map_err(|err| {
                    tracing::error!(error=?err, "twilio error");
                });
        });

        Ok((
            PhoneChallengeState {
                phone_number: destination.clone(),
                h_code: sha256(code.as_bytes()).to_vec(),
            },
            self.duration_between_challenges,
        ))
    }

    pub async fn send_d2p(
        &self,
        state: &State,
        destination: &ValidatedPhoneNumber,
        url: String,
    ) -> Result<SecondsBeforeRetry, ApiError> {
        let message_body = format!(
            "Hello from {}! Continue signing up for your account here: {}",
            self.rp_id, url
        );

        RateLimit {
            state,
            phone_number: destination,
            period: self.duration_between_challenges,
            scope: rate_limit::D2P_LINK,
        }
        .enforce_and_update()
        .await?;

        // spawn this async so we return immediately
        let client = self.client.clone();
        let destination_clone = destination.clone();

        tokio::spawn(async move {
            let _ = client
                .clone()
                .send_message(destination_clone.e164.leak(), message_body)
                .await
                .map_err(|err| {
                    tracing::error!(error=?err, "twilio error");
                });
        });

        Ok(self.duration_between_challenges)
    }
}

mod rate_limit {
    use super::*;

    pub const D2P_LINK: &str = "d2p_session";
    pub const SMS_CHALLENGE: &str = "sms_challenge";

    fn key(phone_number: &ValidatedPhoneNumber, scope: &str) -> String {
        format!("{}:{}", phone_number.e164.leak(), scope)
    }

    pub(super) struct RateLimit<'a> {
        pub(super) state: &'a State,
        pub(super) period: Duration,
        pub(super) phone_number: &'a ValidatedPhoneNumber,
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
