use crate::*;

/// OnboardingConfiguration that was created
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OnboardingConfiguration {
    pub id: ObConfigurationId,
    pub name: String,
    pub key: ObConfigurationKey,
    pub is_live: bool,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    pub must_collect_data: Vec<CollectedDataOption>,
    pub optional_data: Vec<CollectedDataOption>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub is_no_phone_flow: bool,
}

export_schema!(OnboardingConfiguration);

/// The public onboarding configuration
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct PublicOnboardingConfiguration {
    pub name: String,
    pub key: ObConfigurationKey,
    pub org_name: String,
    pub logo_url: Option<String>,
    pub privacy_policy_url: Option<String>,
    pub is_live: bool,
    pub status: ApiKeyStatus,

    pub is_app_clip_enabled: bool,
    pub is_instant_app_enabled: bool,
    pub is_no_phone_flow: bool,
    pub requires_id_doc: bool,
    pub is_kyb: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub appearance: Option<serde_json::Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    /// allow list of origins permitted to host the embedded flow
    pub allowed_origins: Option<Vec<String>>,
}

export_schema!(PublicOnboardingConfiguration);
