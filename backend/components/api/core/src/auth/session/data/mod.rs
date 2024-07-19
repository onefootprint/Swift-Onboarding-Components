pub mod ob_config;
pub mod sdk_args;
pub mod tenant;
pub mod user;

use crypto::aead::ScopedSealingKey;
use newtypes::HasSessionKind;
use newtypes::SealedSessionBytes;
use newtypes::SessionAuthTokenKind;
use newtypes::SessionKind;
use serde::Deserialize;
use serde::Serialize;

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
    /// proven to own an email address via workos auth
    WorkOs(tenant::WorkOsSession),

    /// authed as a user at a tenant for admin dashboard
    TenantRb(tenant::TenantRbSession),

    /// Authed as a firm employee impersonating a tenant with read-only permissions
    FirmEmployee(tenant::FirmEmployeeSession),

    /// Proxy permissions of a tenant into a short-lived token
    ClientTenant(tenant::ClientTenantAuth),

    /// user-specific sessions
    User(user::UserSession),

    /// Used for validating email challenges
    /// NOTE this is no longer used.
    /// Check the context in https://github.com/onefootprint/monorepo/pull/10698
    EmailVerify(user::EmailVerifySession),

    /// Used to prove to a tenant that a user is authed with footprint
    ValidateUserToken(user::ValidateUserToken),

    /// Used to provide a single use onboarding session token for bifrost initialization
    OnboardingSession(ob_config::OnboardingSession),

    /// Used to initialize an onboarding session to KYC an owner of a business
    BusinessOwner(ob_config::BoSession),

    /// Used to pass information into bifrost from the Footprint.js SDK
    SdkArgs(sdk_args::SdkArgsData),
}

// Would be nice to not have to have this, but SessionAuthTokenKind is needed in newtypes...
impl<'a> From<&'a AuthSessionData> for SessionAuthTokenKind {
    fn from(value: &'a AuthSessionData) -> Self {
        match value {
            AuthSessionData::WorkOs(_) => Self::WorkOs,
            AuthSessionData::TenantRb(_) => Self::TenantRb,
            AuthSessionData::FirmEmployee(_) => Self::FirmEmployee,
            AuthSessionData::ClientTenant(_) => Self::ClientTenant,
            AuthSessionData::User(_) => Self::User,
            AuthSessionData::EmailVerify(_) => Self::EmailVerify,
            AuthSessionData::ValidateUserToken(_) => Self::ValidateUserToken,
            AuthSessionData::OnboardingSession(_) => Self::OnboardingSession,
            AuthSessionData::BusinessOwner(_) => Self::BusinessOwner,
            AuthSessionData::SdkArgs(_) => Self::SdkArgs,
        }
    }
}

impl From<ob_config::BoSession> for AuthSessionData {
    fn from(value: ob_config::BoSession) -> Self {
        Self::BusinessOwner(value)
    }
}

impl From<sdk_args::SdkArgsData> for AuthSessionData {
    fn from(value: sdk_args::SdkArgsData) -> Self {
        Self::SdkArgs(value)
    }
}

// Used to store the kind of the token on the session table
impl HasSessionKind for AuthSessionData {
    fn session_kind(&self) -> SessionKind {
        match self {
            Self::WorkOs(_) => SessionKind::WorkOs,
            Self::TenantRb(_) => SessionKind::TenantRb,
            Self::FirmEmployee(_) => SessionKind::FirmEmployee,
            Self::ClientTenant(_) => SessionKind::ClientTenant,
            Self::User(_) => SessionKind::User,
            Self::EmailVerify(_) => SessionKind::EmailVerify,
            Self::ValidateUserToken(_) => SessionKind::ValidateUserToken,
            Self::OnboardingSession(_) => SessionKind::OnboardingSession,
            Self::BusinessOwner(_) => SessionKind::BusinessOwner,
            Self::SdkArgs(_) => SessionKind::SdkArgs,
        }
    }
}
