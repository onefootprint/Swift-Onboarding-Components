use chrono::{DateTime, Utc};
use db::models::ob_configurations::ObConfiguration;
use newtypes::{DataKind, ObConfigStatus, ObConfigurationKey};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiObConfig {
    key: ObConfigurationKey,
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    is_live: bool,
    created_at: DateTime<Utc>,
    status: ObConfigStatus,
}

impl From<ObConfiguration> for ApiObConfig {
    fn from(s: ObConfiguration) -> Self {
        let ObConfiguration {
            key,
            name,
            _created_at,
            must_collect_data_kinds,
            is_disabled,
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
            // TODO don't use debug time and use status enum
            // https://linear.app/footprint/issue/FP-830/add-status-to-ob-config
            created_at: _created_at,
            status: if is_disabled {
                ObConfigStatus::Disabled
            } else {
                ObConfigStatus::Enabled
            },
        }
    }
}
