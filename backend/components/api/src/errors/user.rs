use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
    #[error("Data update request is invalid")]
    InvalidIdentityDataUpdate,
    #[error("Data update is not allowed")]
    DataUpdateNotAllowed,
    #[error("Data update is temporarily not allowed outside of onboarding")]
    NotAllowedOutsideOnboarding,
}
