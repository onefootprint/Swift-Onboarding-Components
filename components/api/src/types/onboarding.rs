use chrono::{DateTime, Utc};
use db::models::onboardings::{Onboarding, OnboardingInfo};
use newtypes::{DataKind, Status};
use paperclip::actix::Apiv2Schema;

use super::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboarding {
    name: String,
    description: Option<String>,
    timestamp: DateTime<Utc>,
    status: Status,
    can_access_data_kinds: Vec<DataKind>,
    insight_event: ApiInsightEvent,
}

impl From<OnboardingInfo> for ApiOnboarding {
    fn from(s: OnboardingInfo) -> Self {
        let Onboarding {
            start_timestamp,
            status,
            ..
        } = s.0;
        let db::models::ob_configurations::ObConfiguration {
            name,
            description,
            can_access_data_kinds,
            ..
        } = s.1;
        Self {
            name,
            description,
            timestamp: start_timestamp,
            status,
            can_access_data_kinds,
            insight_event: ApiInsightEvent::from(s.2),
        }
    }
}
