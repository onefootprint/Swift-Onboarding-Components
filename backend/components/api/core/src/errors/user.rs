use newtypes::{DataIdentifier, IdentityDataKind};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Data update is not allowed without providing the associated tenant")]
    NotAllowedWithoutTenant,
    #[error("Unable to add {0} in this method")]
    InvalidDataKind(IdentityDataKind),
    #[error("Cannot decrypt {0}")]
    CannotDecrypt(DataIdentifier),
    #[error("Cannot send SMS communications to a phone number that isn't verified")]
    PhoneNumberNotVerified,
    #[error("Document type not provided")]
    NoDocumentType,

    #[error("Cannot use fixture phone number in non-sandbox mode.")]
    FixtureNumberInLive,
    #[error("Cannot provide sandbox data in live mode or live data in sandbox mode.")]
    SandboxMismatch,
}
