use newtypes::ContactInfoKind;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Cannot send communications to a {0} that isn't verified")]
    ContactInfoKindNotVerified(ContactInfoKind),
    #[error("No contact info found for user")]
    NoContactInfoForUser,
    #[error("Document type not provided")]
    NoDocumentType,

    #[error("Cannot use fixture email or phone number in non-sandbox mode.")]
    FixtureCIInLive,
    #[error("Cannot provide sandbox data in live mode or live data in sandbox mode.")]
    SandboxMismatch,
    #[error("Invalid auth session: {0}")]
    InvalidAuthSession(String),
    #[error("Must provide an auth playbook public key to create an auth token")]
    PlaybookMissingForAuth,
    #[error("Cannot reonboard user - user has no complete onboardings. Please request additional information by onboarding a user onto a specific Playbook.")]
    NoCompleteOnboardings,
}

impl api_errors::FpErrorTrait for UserError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
