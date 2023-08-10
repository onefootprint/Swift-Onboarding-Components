use crate::utils::db2api::DbToApi;
use db::models::{manual_review::ManualReview, scoped_vault::ScopedVault};

impl DbToApi<ScopedVault> for api_wire_types::UserId {
    fn from_db(target: ScopedVault) -> Self {
        let ScopedVault { fp_id, .. } = target;

        Self { id: fp_id }
    }
}

impl DbToApi<(ScopedVault, Vec<ManualReview>)> for api_wire_types::User {
    fn from_db((sv, manual_reviews): (ScopedVault, Vec<ManualReview>)) -> Self {
        Self {
            id: sv.fp_id,
            status: sv.status,
            requires_manual_review: !manual_reviews.is_empty(),
        }
    }
}
