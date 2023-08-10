use newtypes::{output::Csv, CollectedDataOption};
use newtypes::{ModernIdDocKind, OnboardingRequirementKind, WorkflowId};
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
    #[error("Workflow doesn't exist")]
    NoWorkflow,
    #[error("IDV reqs have already been initiated")]
    IdvReqsAlreadyInitiated,
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
    #[error("No onboarding config provided for onboarding")]
    NoObConfig,
    #[error("Cannot edit completed onboarding")]
    AlreadyCompleted,
    #[error("User consent not found for onboarding")]
    UserConsentNotFound,
    #[error("Business Owner has not been set in Business vault yet")]
    BusinessOwnersNotSet,
    #[error("Expected BO to have an Onboarding but it was not found")]
    MissingBoOnboarding,
    #[error("Expected 1 or more BO's to have an OnboardingDecision but it was not found: {0}")]
    MissingBoOnboardingDecision(Csv<WorkflowId>),
    #[error("Need to provide onboarding public key auth in order to start a sign-up session")]
    MissingObPkAuth,
    #[error("Not expecting a selfie image to be uploaded")]
    NotExpectingSelfie,
    #[error("Non-US documents are not supported")]
    UnsupportedNonUSDocumentCountry,
    #[error("Unsupported document type. Supported document types: {0}")]
    UnsupportedDocumentType(Csv<ModernIdDocKind>),
    #[error("Cannot create a fixture result for a non-sandbox Vault")]
    CannotCreateFixtureResultForNonSandbox,
    #[error("Sandbox vaults must have a fixture result")]
    NoFixtureResultForSandboxUser,
    #[error("Workflow doesn't have an associated onboarding config")]
    NoObcForWorkflow,
    #[error("Workflow doesn't have an associated status")]
    NoStatusForWorkflow,
    #[error("Can only provide one image at a time")]
    OnlyOneImageAllowed,
}
