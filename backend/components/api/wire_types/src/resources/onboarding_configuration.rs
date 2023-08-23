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
    pub optional_data: Vec<CollectedDataOption>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub is_live: bool,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub appearance: Option<serde_json::Value>,
    pub is_app_clip_enabled: bool,
    pub is_instant_app_enabled: bool,
    // Used to display a tenant-specific banner on the app clip
    pub tenant_id: TenantId,
    pub is_no_phone_flow: bool,

    #[serde(skip_serializing_if = "Option::is_none")]
    /// allow list of origins permitted to host the embedded flow
    pub allowed_origins: Option<Vec<String>>,

    pub requires_id_doc: bool,
    pub is_kyb: bool,
}

export_schema!(OnboardingConfiguration);
