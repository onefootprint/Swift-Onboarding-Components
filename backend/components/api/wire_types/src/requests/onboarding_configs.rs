use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct OnboardingConfigFilters {
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
}
