use chrono::{DateTime, Utc};
use db::models::{
    insight_event::InsightEvent,
    scoped_users::{OnboardingInfo, ScopedUser},
};
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::Apiv2Schema;

use super::{insight_event::ApiInsightEvent, onboarding::ApiOnboarding};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiScopedUser {
    pub footprint_user_id: FootprintUserId,
    pub populated_data_kinds: Vec<DataKind>,
    pub start_timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub insight_event: ApiInsightEvent,
    pub onboarding_links: Vec<ApiOnboarding>,
}

impl From<(Vec<DataKind>, &Vec<OnboardingInfo>, ScopedUser, InsightEvent)> for ApiScopedUser {
    fn from(s: (Vec<DataKind>, &Vec<OnboardingInfo>, ScopedUser, InsightEvent)) -> Self {
        let ScopedUser {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = s.2;
        let ob_links = s.1;
        Self {
            footprint_user_id: fp_user_id,
            populated_data_kinds: s.0,
            start_timestamp,
            ordering_id,
            insight_event: ApiInsightEvent::from(s.3),
            onboarding_links: ob_links.iter().map(|x| ApiOnboarding::from(x.clone())).collect(),
        }
    }
}
