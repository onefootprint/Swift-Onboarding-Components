use strum::IntoEnumIterator;

use crate::OnboardingRequirementKind;

use super::WorkflowState;

impl WorkflowState {
    /// List the relevant onboarding requirements that a workflow may require displaying to bifrost.
    pub fn relevant_requirements(&self) -> Vec<OnboardingRequirementKind> {
        match self {
            // KYC workflows may use all onboarding requirements to collect data from customer
            Self::AlpacaKyc(_) | Self::Kyc(_) | Self::Kyb(_) => OnboardingRequirementKind::iter().collect(),
            // Don't want to display any other requirements in a collect doc workflow
            Self::Document(_) => vec![
                OnboardingRequirementKind::CollectDocument,
                OnboardingRequirementKind::Process,
            ],
        }
    }
}
