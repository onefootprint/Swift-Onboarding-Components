use super::WorkflowState;
use crate::OnboardingRequirementKind;
use strum::IntoEnumIterator;

impl WorkflowState {
    /// List the relevant onboarding requirements that a workflow may require displaying to bifrost.
    pub fn relevant_requirements(&self) -> Vec<OnboardingRequirementKind> {
        match self {
            // KYC workflows may use all onboarding requirements to collect data from customer
            Self::AlpacaKyc(_) | Self::Kyc(_) => OnboardingRequirementKind::iter()
                .filter(|o| !matches!(o, OnboardingRequirementKind::CollectBusinessData))
                .collect(),
            Self::Kyb(_) => vec![OnboardingRequirementKind::CollectBusinessData],
            // Don't want to display any other requirements in a collect doc workflow
            Self::Document(_) => vec![
                OnboardingRequirementKind::CollectDocument,
                OnboardingRequirementKind::Process,
            ],
        }
    }
}
