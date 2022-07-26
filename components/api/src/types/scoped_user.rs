use chrono::{DateTime, Utc};
use db::models::{onboardings::OnboardingInfo, scoped_users::ScopedUser};
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::Apiv2Schema;

use super::onboarding::ApiOnboarding;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiScopedUser {
    pub footprint_user_id: FootprintUserId,
    pub populated_data_kinds: Vec<DataKind>,
    pub start_timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub onboardings: Vec<ApiOnboarding>,
}

impl From<(Vec<DataKind>, &Vec<OnboardingInfo>, ScopedUser)> for ApiScopedUser {
    fn from(s: (Vec<DataKind>, &Vec<OnboardingInfo>, ScopedUser)) -> Self {
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
            onboardings: ob_links.iter().map(|x| ApiOnboarding::from(x.clone())).collect(),
        }
    }
}
