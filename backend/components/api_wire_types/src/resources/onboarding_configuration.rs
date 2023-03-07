use crate::*;

/// OnboardingConfiguration that was created
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
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
}

export_schema!(OnboardingConfiguration);
