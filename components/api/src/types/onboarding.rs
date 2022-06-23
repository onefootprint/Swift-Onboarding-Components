use chrono::NaiveDateTime;
use db::models::{insight_event::InsightEvent, onboardings::Onboarding};
use newtypes::{DataKind, FootprintUserId, Status};
use paperclip::actix::Apiv2Schema;

use super::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboarding {
    pub footprint_user_id: FootprintUserId,
    pub status: Status,
    pub populated_data_kinds: Vec<DataKind>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub start_timestamp: NaiveDateTime,
    pub ordering_id: i64,
    pub start_insight_event: ApiInsightEvent,
}

impl From<(Vec<DataKind>, Onboarding, InsightEvent)> for ApiOnboarding {
    fn from(s: (Vec<DataKind>, Onboarding, InsightEvent)) -> Self {
        let Onboarding {
            user_ob_id,
            status,
            created_at,
            updated_at,
            start_timestamp,
            ordering_id,
            ..
        } = s.1;
        ApiOnboarding {
            footprint_user_id: user_ob_id,
            status,
            populated_data_kinds: s.0,
            created_at,
            updated_at,
            start_timestamp,
            ordering_id,
            start_insight_event: ApiInsightEvent::from(s.2),
        }
    }
}
