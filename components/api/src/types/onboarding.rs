use chrono::{DateTime, Utc};
use db::models::{
    insight_event::InsightEvent,
    onboardings::{Onboarding, OnboardingLink},
};
use newtypes::{DataKind, FootprintUserId, Status};
use paperclip::actix::Apiv2Schema;

use super::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboarding {
    pub footprint_user_id: FootprintUserId,
    pub status: Status,
    pub populated_data_kinds: Vec<DataKind>,
    pub start_timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub insight_event: ApiInsightEvent,
}

impl From<(Vec<DataKind>, Onboarding, OnboardingLink, InsightEvent)> for ApiOnboarding {
    fn from(s: (Vec<DataKind>, Onboarding, OnboardingLink, InsightEvent)) -> Self {
        let Onboarding {
            user_ob_id,
            start_timestamp,
            ordering_id,
            ..
        } = s.1;
        // https://linear.app/footprint/issue/FP-661/adapt-orgonboardings-to-support-multiple-ob-configurations-per
        let OnboardingLink { status, .. } = s.2;
        ApiOnboarding {
            footprint_user_id: user_ob_id,
            status,
            populated_data_kinds: s.0,
            start_timestamp,
            ordering_id,
            insight_event: ApiInsightEvent::from(s.3),
        }
    }
}
