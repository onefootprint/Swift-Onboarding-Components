use chrono::{DateTime, Utc};
use db::models::{ob_configuration::ObConfiguration, tenant::Tenant};
use newtypes::{ApiKeyStatus, CollectedDataOption, ObConfigurationId, ObConfigurationKey};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiObConfig {
    id: ObConfigurationId,
    key: ObConfigurationKey,
    name: String,
    org_name: String,
    logo_url: Option<String>,
    must_collect_data: Vec<CollectedDataOption>,
    can_access_data: Vec<CollectedDataOption>,
    is_live: bool,
    created_at: DateTime<Utc>,
    status: ApiKeyStatus,
}

impl From<(ObConfiguration, Tenant)> for ApiObConfig {
    fn from(s: (ObConfiguration, Tenant)) -> Self {
        let ObConfiguration {
            id,
            key,
            name,
            created_at,
            must_collect_data,
            status,
            can_access_data,
            is_live,
            ..
        } = s.0;
        let Tenant {
            name: org_name,
            logo_url,
            ..
        } = s.1;
        Self {
            id,
            key,
            name,
            org_name,
            logo_url,
            must_collect_data,
            can_access_data,
            is_live,
            created_at,
            status,
        }
    }
}
