use chrono::{DateTime, Utc};
use db::models::onboarding::{Onboarding, OnboardingInfo};
use newtypes::{CollectedDataOption, Status};
use paperclip::actix::Apiv2Schema;

use super::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboarding {
    name: String,
    timestamp: DateTime<Utc>,
    status: Status,
    can_access_data: Vec<CollectedDataOption>,
    insight_event: ApiInsightEvent,
}

impl From<OnboardingInfo> for ApiOnboarding {
    fn from(s: OnboardingInfo) -> Self {
        let Onboarding {
            start_timestamp,
            status,
            ..
        } = s.0;
        let db::models::ob_configuration::ObConfiguration {
            name,
            can_access_data,
            ..
        } = s.1;
        Self {
            name,
            timestamp: start_timestamp,
            status,
            can_access_data,
            insight_event: ApiInsightEvent::from(s.2),
        }
    }
}
