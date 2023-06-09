use crate::*;

/// Secret API key
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct SecretApiKey {
    pub id: TenantApiKeyId,
    pub name: String,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<newtypes::secret_api_key::SecretApiKey>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub is_live: bool,
    pub role: OrganizationRole,
}

export_schema!(SecretApiKey);
