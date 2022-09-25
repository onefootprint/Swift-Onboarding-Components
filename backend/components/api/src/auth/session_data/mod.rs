use self::{
    email_verify::EmailVerifySession, user::UserSession, validate_user::ValidateUserToken,
    workos::WorkOsSession,
};
use crypto::aead::ScopedSealingKey;
use newtypes::SealedSessionBytes;
use serde::{Deserialize, Serialize};

pub mod email_verify;
pub mod ob_session;
pub mod user;
pub mod validate_user;
pub mod workos;

impl AuthSessionData {
    pub(crate) fn seal(&self, key: &ScopedSealingKey) -> Result<SealedSessionBytes, crypto::Error> {
        Ok(key.seal(&self)?.into())
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: SealedSessionBytes) -> Result<Self, crypto::Error> {
        let unsealed: Self = key.unseal(sealed.into())?;
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

    /// Used to provide a single use onboarding session token for bifrost initialization
    OnboardingSession(ob_session::OnboardingSession),
}
