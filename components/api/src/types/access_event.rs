use db::models::onboardings::Onboarding;
use db::models::{access_events::AccessEvent, insight_event::InsightEvent};
use newtypes::{DataKind, FootprintUserId, TenantId};
use paperclip::actix::Apiv2Schema;

use crate::types::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiAccessEvent {
    pub fp_user_id: FootprintUserId,
    pub tenant_id: TenantId,
    pub data_kinds: Vec<DataKind>,
    pub reason: String,
    pub principal: Option<String>,
    pub timestamp: chrono::NaiveDateTime,
    pub ordering_id: i64,
    pub insight_event: Option<ApiInsightEvent>,
}

impl From<(AccessEvent, Onboarding, Option<InsightEvent>)> for ApiAccessEvent {
    fn from(s: (AccessEvent, Onboarding, Option<InsightEvent>)) -> Self {
        ApiAccessEvent {
            fp_user_id: s.1.user_ob_id,
            tenant_id: s.1.tenant_id,
            data_kinds: s.0.data_kinds,
            reason: s.0.reason,
            principal: s.0.principal,
            timestamp: s.0.timestamp,
            ordering_id: s.0.ordering_id,
            insight_event: s.2.map(ApiInsightEvent::from),
        }
    }
}
