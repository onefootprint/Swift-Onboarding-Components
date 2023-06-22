use crate::*;

/// OnboardingConfiguration that was created
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OnboardingConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub org_name: String,
    pub logo_url: Option<String>,
    pub privacy_policy_url: Option<String>,
    pub must_collect_data: Vec<CollectedDataOption>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub is_live: bool,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub appearance: Option<serde_json::Value>,
}

export_schema!(OnboardingConfiguration);
