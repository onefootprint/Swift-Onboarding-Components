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

impl From<(TenantApiKey, Option<SecretApiKey>, Option<DateTime<Utc>>)> for TenantApiKeyResponse {
    fn from(s: (TenantApiKey, Option<SecretApiKey>, Option<DateTime<Utc>>)) -> Self {
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
            last_used_at: s.2,
        }
    }
}

impl From<(Option<DateTime<Utc>>, TenantApiKey)> for TenantApiKeyResponse {
    fn from(s: (Option<DateTime<Utc>>, TenantApiKey)) -> Self {
        Self::from((s.1, None, s.0))
    }
}

impl From<(TenantApiKey, Option<SecretApiKey>)> for TenantApiKeyResponse {
    fn from(s: (TenantApiKey, Option<SecretApiKey>)) -> Self {
        Self::from((s.0, s.1, None))
    }
}

impl From<TenantApiKey> for TenantApiKeyResponse {
    fn from(s: TenantApiKey) -> Self {
        Self::from((s, None, None))
    }
}
