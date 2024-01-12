use super::session::{JsonSession, RateLimitRecord};
use crate::{
    errors::{challenge::ChallengeError, ApiResult},
    State,
};
use chrono::Duration;
use chrono::Utc;
use newtypes::PiiString;

fn compute_key(key: &PiiString, scope: &str) -> String {
    // Check SMS rate limits not including sandbox suffix to prevent spamming someone
    format!("{}:{}", key.leak(), scope)
}

pub struct RateLimit<'a> {
    pub period: Duration,
    pub key: &'a PiiString,
    pub scope: &'a str,
}

impl<'a> RateLimit<'a> {
    // TODO: probably just enum these dudes
    pub const BO_SESSION: &'static str = "bo_session";
    pub const DASHBOARD_TRIGGER: &'static str = "dashboard_trigger";
    pub const D2P_LINK: &'static str = "d2p_session";
    pub const SMS_CHALLENGE: &'static str = "sms_challenge";

    pub(super) async fn enforce_and_update(&self, state: &State) -> ApiResult<()> {
        let RateLimit { period, key, scope } = *self;

        let rate_limit_key = compute_key(key, scope);
        let now = Utc::now();

        state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
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
