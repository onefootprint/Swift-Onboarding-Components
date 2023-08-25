use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingResponse {
    pub onboarding_config: PublicOnboardingConfiguration,
}

export_schema!(OnboardingResponse);
