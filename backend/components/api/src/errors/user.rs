use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
    #[error("Data update request is invalid")]
    InvalidIdentityDataUpdate,
    #[error("Cannot add last 4 of SSN when vault already has full SSN")]
    PartialSsnUpdateNotAllowed,
    #[error("Cannot add partial address when vault already has full address")]
    PartialAddressUpdateNotAllowed,
    #[error("Data update is temporarily not allowed outside of onboarding")]
    NotAllowedOutsideOnboarding,
}
