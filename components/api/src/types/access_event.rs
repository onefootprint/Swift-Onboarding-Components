use crate::tenant::types::UserVaultFieldKind;
use db::models::access_events::AccessEvent;
use db::models::onboardings::Onboarding;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiAccessEvent {
    pub fp_user_id: String,
    pub tenant_id: String,
    pub data_kind: UserVaultFieldKind,
    pub timestamp: chrono::NaiveDateTime,
}

impl From<(AccessEvent, Onboarding)> for ApiAccessEvent {
    fn from(s: (AccessEvent, Onboarding)) -> Self {
        ApiAccessEvent {
            fp_user_id: s.1.user_ob_id,
            tenant_id: s.1.tenant_id,
            data_kind: s.0.data_kind.into(),
            timestamp: s.0.timestamp,
        }
    }
}
