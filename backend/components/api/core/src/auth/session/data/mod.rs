pub mod ob_config;
pub mod sdk_args;
pub mod tenant;
pub mod user;

use crypto::aead::ScopedSealingKey;
use newtypes::HasSessionKind;
use newtypes::SealedSessionBytes;
use newtypes::SessionKind;
use newtypes::TenantSessionPurpose;
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

impl AuthSessionData {
    /// A token-type-specific prefix to help differentiate between token kinds.
    /// For example, a dashboard token will look like `dbtok_xxxxx` while a user token will look
    /// like `utok_xxxx`.
    pub fn token_prefix(&self) -> &str {
        match self {
            Self::ClientTenant(_) => "ct",
            Self::User(_) => "u",
            Self::EmailVerify(_) => "ev",
            Self::ValidateUserToken(_) => "v",
            Self::OnboardingSession(_) => "ob",
            Self::BusinessOwner(_) => "bo",
            Self::SdkArgs(_) => "sdk",
            Self::TenantRb(d) if d.purpose == TenantSessionPurpose::Docs => "d",
            Self::FirmEmployee(d) if d.purpose == TenantSessionPurpose::Docs => "d",
            // These three are all very similar purpose.
            Self::WorkOs(_) => "db",
            Self::TenantRb(_) => "db",
            Self::FirmEmployee(_) => "db",
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
