use chrono::{DateTime, Utc};
use db::models::tenant_api_keys::TenantApiKey;
use newtypes::{secret_api_key::SecretApiKey, ApiKeyStatus, TenantApiKeyId};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct TenantApiKeyResponse {
    id: TenantApiKeyId,
    name: String,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,
    key: Option<SecretApiKey>,
    last_used_at: Option<DateTime<Utc>>,
    is_live: bool,
}

impl From<(TenantApiKey, Option<SecretApiKey>)> for TenantApiKeyResponse {
    fn from(s: (TenantApiKey, Option<SecretApiKey>)) -> Self {
        let TenantApiKey {
            id,
            name,
            status,
            created_at,
            is_live,
            ..
        } = s.0;
        Self {
            id,
            name,
            is_live,
            key: s.1,
            created_at,
            status,
            // TODO https://linear.app/footprint/issue/FP-855/build-last-used-at-time-for-secret-key
            last_used_at: None,
        }
    }
}

impl From<TenantApiKey> for TenantApiKeyResponse {
    fn from(s: TenantApiKey) -> Self {
        Self::from((s, None))
    }
}
