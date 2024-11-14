use super::session::JsonSession;
use super::session::RateLimitRecord;
use crate::errors::error_with_code::ErrorWithCode;
use crate::FpResult;
use crate::State;
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
    #[tracing::instrument(skip_all)]
    pub(super) async fn enforce_and_update(&self, state: &State) -> FpResult<()> {
        let RateLimit { period, key, scope } = *self;

        let rate_limit_key = compute_key(key, scope);
        let now = Utc::now();

        state
            .db_query(move |conn| {
                if let Some(session) = JsonSession::<RateLimitRecord>::get(conn, &rate_limit_key)? {
                    let time_since_last_sent = now - session.data.sent_at;
                    if time_since_last_sent < period {
                        // num_seconds() only returns count of whole seconds, so we add one to avoid returning
                        // 0 seconds as time remaining
                        let time_remaining = (period - time_since_last_sent).num_seconds() + 1;
                        tracing::info!(%time_remaining, "Rate limited");
                        return Err(ErrorWithCode::RateLimited(time_remaining).into());
                    }
                }

                let record = RateLimitRecord { sent_at: now };
                JsonSession::update_or_create(conn, &rate_limit_key, &record, now + period)?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}
