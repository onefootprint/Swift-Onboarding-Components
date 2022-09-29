use crypto::aead::ScopedSealingKey;
use newtypes::SealedSessionBytes;
use serde::{Deserialize, Serialize};

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
    WorkOs(crate::auth::tenant::WorkOsSession),

    /// user-specific sessions
    User(crate::auth::user::UserSession),

    /// Used for validating email challenges
    EmailVerify(crate::auth::user::EmailVerifySession),

    /// Used to prove to a tenant that a user is authed with footprint
    ValidateUserToken(crate::auth::user::ValidateUserToken),

    /// Used to provide a single use onboarding session token for bifrost initialization
    OnboardingSession(crate::auth::tenant::OnboardingSession),
}
