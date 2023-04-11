use newtypes::{CollectedDataOption, DataIdentifier, IdentityDataKind};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
    #[error("Cannot replace {0} in vault")]
    CannotReplaceData(DataIdentifier),
    #[error("Cannot add {0} when user vault already has full data")]
    PartialUpdateNotAllowed(CollectedDataOption),
    #[error("Data update is not allowed without providing the associated tenant")]
    NotAllowedWithoutTenant,
    #[error("Unable to add {0} in this method")]
    InvalidDataKind(IdentityDataKind),
    #[error("Cannot decrypt {0}")]
    CannotDecrypt(DataIdentifier),
}
