use newtypes::{ContactInfoKind, DataIdentifier, IdentityDataKind};
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
    #[error("Cannot send email communications to an email that isn't verified")]
    EmailNotVerified,
    #[error("Cannot send communications to a {0} that isn't verified")]
    ContactInfoKindNotVerified(ContactInfoKind),
    #[error("No verified contact info found for user")]
    NoVerifiedContactInfoForUser,
    #[error("Document type not provided")]
    NoDocumentType,

    #[error("Cannot use fixture phone number in non-sandbox mode.")]
    FixtureNumberInLive,
    #[error("Cannot provide sandbox data in live mode or live data in sandbox mode.")]
    SandboxMismatch,
    #[error("Invalid auth session: {0}")]
    InvalidAuthSession(String),
    #[error("Must provide either a playbook public key or a user auth with a playbook attached in order to create a sign_up token")]
    ObConfigRequiredForSignUp,
}
