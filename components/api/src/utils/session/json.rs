use chrono::{DateTime, Utc};
use crypto::sha256;
use db::{models::sessions::Session, PgConnection};
use newtypes::{Base64Data, D2pSessionStatus};
use serde::{de::DeserializeOwned, Serialize};

use crate::errors::ApiError;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RateLimitRecord {
    pub sent_at: DateTime<Utc>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HandoffRecord {
    pub status: D2pSessionStatus,
}

pub struct JsonSession<C>
where
    C: Serialize + DeserializeOwned,
{
    pub expires_at: DateTime<Utc>,
    pub data: C,
}

pub struct JsonSessionKey(String);

impl<S> From<S> for JsonSessionKey
where
    S: AsRef<str>,
{
    fn from(s: S) -> Self {
        let s = s.as_ref();
        Self(Base64Data(sha256(format!("json_sesson:{s}").as_bytes()).to_vec()).to_string())
    }
}

impl<C> JsonSession<C>
where
    C: Serialize + DeserializeOwned,
{
    pub fn get<S: Into<JsonSessionKey>>(conn: &mut PgConnection, key: S) -> Result<Option<Self>, ApiError> {
        let session = Session::get(conn, key.into().0)?;
        let session = if let Some(session) = session {
            Some(Self {
                expires_at: session.expires_at,
                data: serde_json::from_slice(session.data.as_ref())?,
            })
        } else {
            None
        };
        Ok(session)
    }

    pub fn update_or_create<S: Into<JsonSessionKey>>(
        conn: &mut PgConnection,
        key: S,
        data: &C,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        let data = serde_json::to_vec(data)?;
        Session::update_or_create(conn, key.into().0, data, expires_at)?;
        Ok(())
    }
}
