use db::models::{manual_review::ManualReview, scoped_vault::ScopedVault};
use newtypes::OnboardingStatus;

use crate::utils::db2api::DbToApi;

impl DbToApi<(OnboardingStatus, ScopedVault, Option<ManualReview>)>
    for api_wire_types::EntityValidateResponse
{
    fn from_db((status, sv, mr): (OnboardingStatus, ScopedVault, Option<ManualReview>)) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status,
            requires_manual_review: mr.is_some(),
        }
    }
}
