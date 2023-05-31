use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingResponse {
    /// If the onboarding already exists and is authorized and if there are no requirements, we should skip requirements
    /// TODO: rename to all_requirements_handled?
    pub already_authorized: bool,
    pub onboarding_config: OnboardingConfiguration,
}

export_schema!(OnboardingResponse);
