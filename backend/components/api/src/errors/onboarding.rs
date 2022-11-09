use newtypes::{CollectedDataOption, DocumentRequestId, OnboardingStatus};
use thiserror::Error;

use crate::types::onboarding_requirement::OnboardingRequirementDiscriminant;

#[derive(Debug, Error)]
pub enum OnboardingError {
    #[error("token invalid or not found")]
    ValidateTokenInvalidOrNotFound,
    #[error("onboarding for tenant, user pair does not exist")]
    OnboardingForTenantDoesNotExist,
    #[error("webauthn credential not set")]
    WebauthnCredentialsNotSet,
    #[error("Sandbox users must be used in sandbox mode")]
    InvalidSandboxState,
    #[error("Onboarding does not exist")]
    NoOnboarding,
    #[error("Onboarding is in wrong KYC state: {0}")]
    WrongKycState(OnboardingStatus),
    #[error("Tenant does not match")]
    TenantMismatch,
    #[error("Unmet onboarding requirements: {0:?}")]
    UnmetRequirements(Vec<OnboardingRequirementDiscriminant>),
    #[error("Required attributes are not set: {0:?}")]
    MissingAttributes(Vec<CollectedDataOption>),
    #[error("Onboarding is not in a terminal state: {0:?}")]
    NonTerminalState(OnboardingStatus),
    #[error("No pending document request found: {0}")]
    NoPendingDocumentRequestFound(DocumentRequestId),
}
