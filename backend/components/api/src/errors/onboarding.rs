use newtypes::CollectedDataOption;
use thiserror::Error;

use crate::types::onboarding_requirement::OnboardingRequirementDiscriminant;

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
    #[error("Unmet onboarding requirements: {0:?}")]
    UnmetRequirements(Vec<OnboardingRequirementDiscriminant>),
    #[error("Required attributes are not set: {0:?}")]
    MissingAttributes(Vec<CollectedDataOption>),
    #[error("Onboarding is not in a terminal state")]
    NonTerminalState,
    #[error("No pending document request found")]
    NoPendingDocumentRequestFound,
    #[error("No decision can be made from decision engine")]
    NoDecisionMade,
    #[error("Cannot onboard a non-portable scoped user onto any ob config")]
    NonPortableScopedUser,
    #[error("Cannot edit completed onboarding")]
    AlreadyCompleted,
}
