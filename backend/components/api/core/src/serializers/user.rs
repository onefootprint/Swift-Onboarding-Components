use crate::utils::db2api::DbToApi;
use db::models::{manual_review::ManualReview, scoped_vault::ScopedVault, vault::Vault};

impl DbToApi<(ScopedVault, Vault)> for api_wire_types::LiteUser {
    fn from_db((sv, vault): (ScopedVault, Vault)) -> Self {
        let ScopedVault { fp_id, .. } = sv;
        let Vault { sandbox_id, .. } = vault;

        Self {
            id: fp_id,
            sandbox_id,
        }
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
