use crate::utils::db2api::DbToApi;
use db::models::manual_review::ManualReview;
use db::models::scoped_vault::ScopedVault;
use newtypes::OnboardingStatus;

impl DbToApi<(OnboardingStatus, ScopedVault, Vec<ManualReview>)> for api_wire_types::EntityValidateResponse {
    fn from_db((status, sv, mrs): (OnboardingStatus, ScopedVault, Vec<ManualReview>)) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status,
            requires_manual_review: !mrs.is_empty(),
        }
    }
}
