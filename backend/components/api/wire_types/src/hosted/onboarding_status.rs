use crate::*;

use newtypes::OnboardingRequirement;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingStatusResponse {
    pub requirements: Vec<OnboardingRequirement>,
    pub met_requirements: Vec<OnboardingRequirement>,
    pub ob_configuration: OnboardingConfiguration,
}

export_schema!(OnboardingStatusResponse);
