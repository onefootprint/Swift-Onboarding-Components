use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerRequest {
    pub trigger: TriggerInfo,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKycRequest {
    pub onboarding_config_key: ObConfigurationKey,
}
