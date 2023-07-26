use newtypes::{output::Csv, CollectedDataOption, OnboardingId};
use newtypes::{ModernIdDocKind, OnboardingRequirementKind};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum OnboardingError {
    #[error("Token invalid or not found")]
    ValidateTokenInvalidOrNotFound,
    #[error("Webauthn credential not set")]
    WebauthnCredentialsNotSet,
    #[error("Sandbox users must be used in sandbox mode")]
    InvalidSandboxState,
    #[error("Onboarding does not exist")]
    NoOnboarding,
    #[error("Workflow does not exist")]
    NoWorkflow,
    #[error("IDV reqs have already been initiated")]
    IdvReqsAlreadyInitiated,
    #[error("Onboarding does not need a decision")]
    OnboardingDecisionNotNeeded,
    #[error("Tenant does not match")]
    TenantMismatch,
    #[error("Unmet onboarding requirements: {0}")]
    UnmetRequirements(Csv<OnboardingRequirementKind>),
    #[error("Required attributes are not set: {0}")]
    MissingAttributes(Csv<CollectedDataOption>),
    #[error("Onboarding is not in a terminal state")]
    NonTerminalState,
    #[error("Identity document is not pending upload")]
    IdentityDocumentNotPending,
    #[error("Cannot create a document when no document request exists")]
    NoDocumentRequestFound,
    #[error("Cannot onboard a non-portable scoped user onto any ob config")]
    NonPortableScopedUser,
    #[error("Cannot edit completed onboarding")]
    AlreadyCompleted,
    #[error("User consent not found for onboarding")]
    UserConsentNotFound,
    #[error("Business Owner has not been set in Business vault yet")]
    BusinessOwnersNotSet,
    #[error("Expected BO to have an Onboarding but it was not found")]
    MissingBoOnboarding,
    #[error("Expected 1 or more BO's to have an OnboardingDecision but it was not found: {0}")]
    MissingBoOnboardingDecision(Csv<OnboardingId>),
    #[error("Need to provide onboarding public key auth in order to start a sign-up session")]
    MissingObPkAuth,
    #[error("Not expecting a selfie image to be uploaded")]
    NotExpectingSelfie,
    #[error("Non-US documents are not supported")]
    UnsupportedNonUSDocumentCountry,
    #[error("Unsupported document type. Supported document types: {0}")]
    UnsupportedDocumentType(Csv<ModernIdDocKind>),
    #[error("Cannot create a document fixture result for a non-sandbox Vault")]
    CannotCreateFixtureResultForNonSandbox,
    #[error("Can only provide one image at a time")]
    OnlyOneImageAllowed,
}
