use chrono::{DateTime, Utc};
use db::models::onboarding::{Onboarding, OnboardingInfo};
use newtypes::{CollectedDataOption, DataAttribute, Status};
use paperclip::actix::Apiv2Schema;

use super::insight_event::FpInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct FpOnboarding {
    name: String,
    timestamp: DateTime<Utc>,
    status: Status,
    can_access_data: Vec<CollectedDataOption>,
    can_access_data_attributes: Vec<DataAttribute>,
    insight_event: FpInsightEvent,
}

impl From<OnboardingInfo> for FpOnboarding {
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
        let can_access_data_attributes = can_access_data.iter().flat_map(|x| x.attributes()).collect();
        Self {
            name,
            timestamp: start_timestamp,
            status,
            can_access_data,
            can_access_data_attributes,
            insight_event: FpInsightEvent::from(s.2),
        }
    }
}
