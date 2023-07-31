use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct OnboardingConfigFilters {
    pub status: Option<ApiKeyStatus>,
}

export_schema!(OnboardingConfigFilters);
