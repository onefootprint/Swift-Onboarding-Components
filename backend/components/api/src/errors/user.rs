use newtypes::{CollectedDataOption, DataIdentifier, IdentityDataKind};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
    #[error("User vault already has {0}")]
    CannotReplaceData(DataIdentifier),
    #[error("Cannot add {0} when user vault already has full data")]
    PartialUpdateNotAllowed(CollectedDataOption),
    #[error("Data update is not allowed without providing the associated tenant")]
    NotAllowedWithoutTenant,
    #[error("Data update is not allowed without business")]
    NotAllowedWithoutBusiness,
    #[error("Unable to add {0} in this method")]
    InvalidDataKind(IdentityDataKind),
}
