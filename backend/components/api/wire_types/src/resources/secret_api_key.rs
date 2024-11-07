use crate::*;
use newtypes::ApiKeyStatus;
use newtypes::PiiString;
use newtypes::TenantApiKeyId;

/// Secret API key
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct DashboardSecretApiKey {
    pub id: TenantApiKeyId,
    pub name: String,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<newtypes::secret_api_key::SecretApiKey>,
    pub scrubbed_key: PiiString,
    pub last_used_at: Option<DateTime<Utc>>,
    pub is_live: bool,
    pub role: OrganizationRole,
}
