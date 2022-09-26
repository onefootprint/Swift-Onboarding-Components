use newtypes::KycStatus;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum OnboardingError {
    #[error("missing fields required for user signup: {0}")]
    UserMissingRequiredFields(String),
    #[error("token invalid or not found")]
    ValidateTokenInvalidOrNotFound,
    #[error("onboarding for tenant, user pair does not exist")]
    OnboardingForTenantDoesNotExist,
    #[error("webauthn credential not set")]
    WebauthnCredentialsNotSet,
    #[error("Sandbox users must be used in sandbox mode")]
    InvalidSandboxState,
    #[error("Onboarding does not exist")]
    NoOnboarding,
    #[error("Onboarding is in wrong KYC state: {0}")]
    WrongKycState(KycStatus),
    #[error("Tenant does not match")]
    TenantMismatch,
}
