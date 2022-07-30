use chrono::{DateTime, Utc};
use db::models::ob_configurations::ObConfiguration;
use newtypes::{ApiKeyStatus, DataKind, ObConfigurationKey};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiObConfig {
    key: ObConfigurationKey,
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    is_live: bool,
    created_at: DateTime<Utc>,
    status: ApiKeyStatus,
}

impl From<ObConfiguration> for ApiObConfig {
    fn from(s: ObConfiguration) -> Self {
        let ObConfiguration {
            key,
            name,
            created_at,
            must_collect_data_kinds,
            status,
            can_access_data_kinds,
            is_live,
            ..
        } = s;
        Self {
            key,
            name,
            must_collect_data_kinds,
            can_access_data_kinds,
            is_live,
            created_at,
            status,
        }
    }
}
