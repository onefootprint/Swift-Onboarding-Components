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
            is_enabled,
            _created_at,
            is_live,
            ..
        } = s.0;
        Self {
            id,
            name: "Secret API key".to_owned(),
            is_live,
            key: s.1,
            // TODO don't use debug time and use status enum
            // https://linear.app/footprint/issue/FP-835/add-status-to-secret-key
            created_at: _created_at,
            last_used_at: None,
            status: if is_enabled {
                ApiKeyStatus::Enabled
            } else {
                ApiKeyStatus::Disabled
            },
        }
    }
}

impl From<TenantApiKey> for TenantApiKeyResponse {
    fn from(s: TenantApiKey) -> Self {
        Self::from((s, None))
    }
}
