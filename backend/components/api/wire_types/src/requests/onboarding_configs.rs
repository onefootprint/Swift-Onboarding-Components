use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct OnboardingConfigFilters {
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
}

export_schema!(OnboardingConfigFilters);
