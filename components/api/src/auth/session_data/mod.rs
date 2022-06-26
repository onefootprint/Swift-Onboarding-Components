use crate::{errors::ApiError, State};

use self::{
    email::email_verify::EmailVerifySession,
    tenant::workos::WorkOsSession,
    user::{d2p::D2pSession, my_fp::My1fpBasicSession, onboarding::OnboardingSession},
};
use chrono::{Duration, NaiveDateTime, Utc};
use crypto::aead::ScopedSealingKey;
use db::models::sessions::Session;
use newtypes::{SealedSessionBytes, SessionAuthToken};
use serde::{Deserialize, Serialize};

use super::AuthError;
pub mod email;
pub mod tenant;
pub mod user;

/// This struct is sealed, and then stored in the DB
#[derive(Debug, Clone)]
pub struct ServerSession {
    pub expires_at: NaiveDateTime,
    pub data: SessionData,
}

/// a private type to prevent ServerSession from being serialized, deserialized
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PrivateServerSession {
    expires_at: NaiveDateTime,
    data: SessionData,
}

impl ServerSession {
    pub fn new(data: SessionData, expires_at: NaiveDateTime) -> Self {
        Self { expires_at, data }
    }

    /// create the session
    pub async fn create(
        state: &State,
        data: SessionData,
        expires_in: Duration,
    ) -> Result<SessionAuthToken, ApiError> {
        let expires_at = Utc::now().naive_utc() + expires_in;
        let server_session = ServerSession::new(data, expires_at);
        let sealed_session_data = server_session.seal(&state.session_sealing_key)?;

        let (_, auth_token) = Session::create(&state.db_pool, sealed_session_data, expires_at).await?;

        Ok(auth_token)
    }

    pub(super) fn seal(self, key: &ScopedSealingKey) -> Result<SealedSessionBytes, ApiError> {
        let internal = PrivateServerSession {
            expires_at: self.expires_at,
            data: self.data,
        };

        Ok(SealedSessionBytes(key.seal(&internal)?))
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &SealedSessionBytes) -> Result<Self, ApiError> {
        let unsealed: PrivateServerSession = key.unseal(sealed.as_ref())?;

        if unsealed.expires_at < Utc::now().naive_utc() {
            return Err(AuthError::SessionExpired)?;
        }
        Ok(Self {
            expires_at: unsealed.expires_at,
            data: unsealed.data,
        })
    }
}

/// Represents various types of session data our server maybe storing
/// in its encrypted session store
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum SessionData {
    /// workos login to tenant admin
    WorkOs(WorkOsSession),
    /// onboarding a user to a tenant
    Onboarding(OnboardingSession),

    /// my.onefootprint.com
    My1fp(My1fpBasicSession),

    /// desktop 2 phone transfer session
    D2p(D2pSession),

    /// Used for validating email challenges
    EmailVerify(EmailVerifySession),
}

/// Associates an HTTP header name with type
pub trait HeaderName {
    fn header_name() -> String;
}