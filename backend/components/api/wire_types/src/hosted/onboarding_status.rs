use crate::*;

use newtypes::OnboardingRequirement;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingStatusResponse {
    pub all_requirements: Vec<ApiOnboardingRequirement>,
    pub ob_configuration: PublicOnboardingConfiguration,
}

export_schema!(OnboardingStatusResponse);

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct ApiOnboardingRequirement {
    pub is_met: bool,
    #[serde(flatten)]
    pub requirement: OnboardingRequirement,
}
