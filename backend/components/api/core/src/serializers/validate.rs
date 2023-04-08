use db::models::onboarding::{BasicOnboardingInfo, Onboarding};

use crate::utils::db2api::DbToApi;

impl DbToApi<BasicOnboardingInfo<Onboarding>> for api_wire_types::EntityValidateResponse {
    fn from_db((ob, sv, manual_review, _): BasicOnboardingInfo<Onboarding>) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status: ob.status,
            requires_manual_review: manual_review.is_some(),
        }
    }
}
