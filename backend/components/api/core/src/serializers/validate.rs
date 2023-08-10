use db::models::{
    onboarding::{BasicOnboardingInfo, Onboarding},
    workflow::Workflow,
};

use crate::utils::db2api::DbToApi;

impl DbToApi<(BasicOnboardingInfo<Onboarding>, Option<Workflow>)> for api_wire_types::EntityValidateResponse {
    fn from_db(
        ((ob, sv, manual_review, _), wf): (BasicOnboardingInfo<Onboarding>, Option<Workflow>),
    ) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status: ob.status(wf.as_ref()),
            requires_manual_review: manual_review.is_some(),
        }
    }
}
