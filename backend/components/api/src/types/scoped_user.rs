use chrono::{DateTime, Utc};
use db::models::{onboarding::OnboardingInfo, scoped_user::ScopedUser};
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
    pub is_portable: bool,
}

impl ApiScopedUser {
    pub fn from(
        populated_data_kinds: Vec<DataKind>,
        onboarding_info: &[OnboardingInfo],
        scoped_user: ScopedUser,
        is_portable: bool,
    ) -> Self {
        let ScopedUser {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_user;

        ApiScopedUser {
            footprint_user_id: fp_user_id,
            populated_data_kinds,
            start_timestamp,
            ordering_id,
            is_portable,
            onboardings: onboarding_info
                .iter()
                .map(|x| ApiOnboarding::from(x.clone()))
                .collect(),
        }
    }
}
