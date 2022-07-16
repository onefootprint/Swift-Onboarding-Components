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
    #[error("Sandbox phone numbers must be provided in sandbox mode")]
    InvalidSandboxState,
}
