use self::{
    email::email_verify::EmailVerifySession,
    tenant::workos::WorkOsSession,
    user::{d2p::D2pSession, my_fp::My1fpBasicSession, onboarding::OnboardingSession, user::UserSession},
    validate_user::ValidateUserToken,
};
use crate::errors::ApiError;
use chrono::{DateTime, Utc};
use crypto::aead::ScopedSealingKey;
use newtypes::SealedSessionBytes;
use serde::{Deserialize, Serialize};

use super::AuthError;
pub mod email;
pub mod tenant;
pub mod user;
pub mod validate_user;

/// This struct is sealed, and then stored in the DB
#[derive(Debug, Clone)]
pub struct ServerSession {
    pub expires_at: DateTime<Utc>,
    pub data: SessionData,
}

/// a private type to prevent ServerSession from being serialized, deserialized
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PrivateServerSession {
    expires_at: DateTime<Utc>,
    data: SessionData,
}

impl ServerSession {
    pub fn new(data: SessionData, expires_at: DateTime<Utc>) -> Self {
        Self { expires_at, data }
    }

    pub(crate) fn seal(self, key: &ScopedSealingKey) -> Result<SealedSessionBytes, crypto::Error> {
        let internal = PrivateServerSession {
            expires_at: self.expires_at,
            data: self.data,
        };

        Ok(SealedSessionBytes(key.seal(&internal)?))
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &SealedSessionBytes) -> Result<Self, ApiError> {
        let unsealed: PrivateServerSession = key.unseal(sealed.as_ref())?;

        if unsealed.expires_at < Utc::now() {
            return Err(AuthError::SessionExpired.into());
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

    /// user-specific sessions
    User(UserSession),

    /// Used for validating email challenges
    EmailVerify(EmailVerifySession),

    /// Used to prove to a tenant that a user is authed with footprint
    ValidateUserToken(ValidateUserToken),

    // TODO remove all of these after flattening
    Onboarding(OnboardingSession),
    My1fp(My1fpBasicSession),
    D2p(D2pSession),
}

/// Associates an HTTP header name with type
pub trait HeaderName {
    fn header_names() -> Vec<&'static str>;
}
