use crate::FpResult;
use chrono::DateTime;
use chrono::Utc;
use crypto::sha256;
use db::models::session::Session;
use db::PgConn;
use newtypes::AuthTokenHash;
use newtypes::Base64Data;
use newtypes::D2pSessionStatus;
use newtypes::HandoffMetadata;
use newtypes::HasSessionKind;
use newtypes::SessionKind;
use serde::de::DeserializeOwned;
use serde::Serialize;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RateLimitRecord {
    pub sent_at: DateTime<Utc>,
}

impl HasSessionKind for RateLimitRecord {
    fn session_kind(&self) -> SessionKind {
        SessionKind::RateLimit
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HandoffRecord {
    pub status: D2pSessionStatus,
    pub meta: Option<HandoffMetadata>,
}

impl HasSessionKind for HandoffRecord {
    fn session_kind(&self) -> SessionKind {
        SessionKind::Handoff
    }
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

impl From<JsonSessionKey> for AuthTokenHash {
    fn from(s: JsonSessionKey) -> Self {
        Self::from(s.0)
    }
}

impl<C> JsonSession<C>
where
    C: Serialize + DeserializeOwned + HasSessionKind,
{
    pub fn get<S: Into<JsonSessionKey>>(conn: &mut PgConn, key: S) -> FpResult<Option<Self>> {
        let session = Session::get(conn, key.into().0.into())?;
        let session = if let Some(session) = session {
            if session.expires_at < Utc::now() {
                // Don't error when the session is expired, just return nothing
                None
            } else {
                Some(Self {
                    expires_at: session.expires_at,
                    data: serde_json::from_slice(session.data.as_ref())?,
                })
            }
        } else {
            None
        };
        Ok(session)
    }

    pub fn update_or_create<S: Into<JsonSessionKey>>(
        conn: &mut PgConn,
        key: S,
        data: &C,
        expires_at: DateTime<Utc>,
    ) -> FpResult<()> {
        let kind = data.session_kind();
        let data = serde_json::to_vec(data)?;
        Session::update_or_create(conn, key.into().0.into(), data, kind, expires_at)?;
        Ok(())
    }
}
