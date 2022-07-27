use self::{
    email_verify::EmailVerifySession, user::UserSession, validate_user::ValidateUserToken,
    workos::WorkOsSession,
};
use crate::errors::ApiError;
use crypto::aead::ScopedSealingKey;
use newtypes::SealedSessionBytes;
use serde::{Deserialize, Serialize};

pub mod email_verify;
pub mod user;
pub mod validate_user;
pub mod workos;

impl AuthSessionData {
    pub(crate) fn seal(&self, key: &ScopedSealingKey) -> Result<SealedSessionBytes, crypto::Error> {
        Ok(SealedSessionBytes(key.seal(&self)?))
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &SealedSessionBytes) -> Result<Self, ApiError> {
        let unsealed: Self = key.unseal(sealed.as_ref())?;
        Ok(unsealed)
    }
}

/// Represents various types of session data our server maybe storing
/// in its encrypted session store
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum AuthSessionData {
    /// workos login to tenant admin
    WorkOs(WorkOsSession),

    /// user-specific sessions
    User(UserSession),

    /// Used for validating email challenges
    EmailVerify(EmailVerifySession),

    /// Used to prove to a tenant that a user is authed with footprint
    ValidateUserToken(ValidateUserToken),
}

/// Associates an HTTP header name with type
pub trait ExtractableAuthSession {
    fn header_names() -> Vec<&'static str>;
}
