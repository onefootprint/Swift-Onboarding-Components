use api_wire_types::hosted::onboarding_requirement::OnboardingRequirementDiscriminant;
use newtypes::{output::Csv, CollectedDataOption, OnboardingId};
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
    #[error("IDV reqs have already been initiated")]
    IdvReqsAlreadyInitiated,
    #[error("Onboarding does not need a decision")]
    OnboardingDecisionNotNeeded,
    #[error("Tenant does not match")]
    TenantMismatch,
    #[error("Unmet onboarding requirements: {0}")]
    UnmetRequirements(Csv<OnboardingRequirementDiscriminant>),
    #[error("Required attributes are not set: {0}")]
    MissingAttributes(Csv<CollectedDataOption>),
    #[error("Onboarding is not in a terminal state")]
    NonTerminalState,
    #[error("No pending document request found")]
    NoPendingDocumentRequestFound,
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
}
