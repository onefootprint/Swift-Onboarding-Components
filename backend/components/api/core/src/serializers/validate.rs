use db::models::{
    manual_review::ManualReview,
    onboarding::{BasicOnboardingInfo, Onboarding},
    workflow::Workflow,
};

use crate::utils::db2api::DbToApi;

impl
    DbToApi<(
        BasicOnboardingInfo<Onboarding>,
        Option<ManualReview>,
        Option<Workflow>,
    )> for api_wire_types::EntityValidateResponse
{
    fn from_db(
        ((ob, sv, _), mr, wf): (
            BasicOnboardingInfo<Onboarding>,
            Option<ManualReview>,
            Option<Workflow>,
        ),
    ) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status: ob.status(wf.as_ref()),
            requires_manual_review: mr.is_some(),
        }
    }
}
