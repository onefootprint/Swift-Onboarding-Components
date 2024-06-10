use crate::utils::db2api::DbToApi;
use db::models::manual_review::ManualReview;
use db::models::scoped_vault::ScopedVault;

impl DbToApi<(ScopedVault, Vec<ManualReview>)> for api_wire_types::Business {
    fn from_db((sv, manual_reviews): (ScopedVault, Vec<ManualReview>)) -> Self {
        Self {
            id: sv.fp_id,
            status: sv.status,
            requires_manual_review: !manual_reviews.is_empty(),
            external_id: sv.external_id,
        }
    }
}
