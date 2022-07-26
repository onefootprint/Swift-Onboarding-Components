use chrono::{DateTime, Utc};
use crypto::sha256;
use db::models::sessions::Session;
use newtypes::Base64Data;

use crate::{errors::ApiError, State};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RateLimitRecord {
    pub sent_at: DateTime<Utc>,
}

pub struct RateLimitSession {
    pub key: String,
    pub expires_at: DateTime<Utc>,
    pub data: RateLimitRecord,
}

impl RateLimitSession {
    fn key(rate_limit_key: &str) -> String {
        Base64Data(sha256(rate_limit_key.as_bytes()).to_vec()).to_string()
    }

    pub async fn get(state: &State, rate_limit_key: &str) -> Result<Option<Self>, ApiError> {
        let key = Self::key(rate_limit_key);
        let session: Option<Session> = state
            .db_pool
            .db_query(move |conn| Session::get(conn, key))
            .await??;
        let session = if let Some(session) = session {
            Some(Self {
                key: session.key,
                expires_at: session.expires_at,
                data: serde_json::from_slice(session.data.as_ref())?,
            })
        } else {
            None
        };
        Ok(session)
    }

    pub async fn update_or_create(
        state: &State,
        rate_limit_key: &str,
        sent_at: DateTime<Utc>,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        let key = Self::key(rate_limit_key);
        let data = serde_json::to_vec(&RateLimitRecord { sent_at })?;
        state
            .db_pool
            .db_query(move |conn| Session::update_or_create(conn, key, data, expires_at))
            .await??;
        Ok(())
    }
}
