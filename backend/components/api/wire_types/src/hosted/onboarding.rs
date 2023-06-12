use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingResponse {
    pub onboarding_config: OnboardingConfiguration,
}

export_schema!(OnboardingResponse);
