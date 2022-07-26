use chrono::{DateTime, Utc};
use crypto::sha256;
use db::{models::sessions::Session, DbError, PgConnection};
use newtypes::Base64Data;
use serde::{de::DeserializeOwned, Serialize};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RateLimitRecord {
    pub sent_at: DateTime<Utc>,
}

pub struct JsonSession<C>
where
    C: Serialize + DeserializeOwned,
{
    pub expires_at: DateTime<Utc>,
    pub data: C,
}

impl<C> JsonSession<C>
where
    C: Serialize + DeserializeOwned,
{
    fn key(key: &str) -> String {
        Base64Data(sha256(format!("json_sesson:{key}").as_bytes()).to_vec()).to_string()
    }

    pub fn get(conn: &mut PgConnection, key: &str) -> Result<Option<Self>, DbError> {
        let key = Self::key(key);
        let session = Session::get(conn, key)?;
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

    pub fn update_or_create(
        conn: &mut PgConnection,
        key: &str,
        data: &C,
        expires_at: DateTime<Utc>,
    ) -> Result<(), DbError> {
        let key = Self::key(key);
        let data = serde_json::to_vec(data)?;
        Session::update_or_create(conn, key, data, expires_at)?;
        Ok(())
    }
}
