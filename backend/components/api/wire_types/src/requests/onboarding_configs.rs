use crate::*;
use newtypes::{input::Csv, ApiKeyStatus, ObConfigurationKind};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct OnboardingConfigFilters {
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
    pub kinds: Option<Csv<ObConfigurationKind>>,
}
