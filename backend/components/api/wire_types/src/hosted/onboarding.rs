use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingResponse {
    /// If the onboarding already exists and is authorized, we should skip requirements
    pub already_authorized: bool,
    pub onboarding_config: OnboardingConfiguration,
}

export_schema!(OnboardingResponse);
