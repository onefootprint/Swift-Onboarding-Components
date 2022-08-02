use chrono::{DateTime, Utc};
use db::models::{ob_configurations::ObConfiguration, tenants::Tenant};
use newtypes::{ApiKeyStatus, DataKind, ObConfigurationId, ObConfigurationKey};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiObConfig {
    id: ObConfigurationId,
    key: ObConfigurationKey,
    name: String,
    org_name: String,
    logo_url: Option<String>,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
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
            must_collect_data_kinds,
            status,
            can_access_data_kinds,
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
            must_collect_data_kinds,
            can_access_data_kinds,
            is_live,
            created_at,
            status,
        }
    }
}
