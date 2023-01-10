use newtypes::CollectedDataOption;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
    #[error("Data update request is invalid")]
    InvalidDataUpdate,
    #[error("Cannot add {0} when user vault already has full data")]
    PartialUpdateNotAllowed(CollectedDataOption),
    #[error("Data update is not allowed without providing the associated tenant")]
    NotAllowedWithoutTenant,
}
