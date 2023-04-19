use crate::utils::db2api::DbToApi;
use db::models::scoped_vault::ScopedVault;

impl DbToApi<ScopedVault> for api_wire_types::User {
    fn from_db(target: ScopedVault) -> Self {
        let ScopedVault { fp_id, .. } = target;

        Self { id: fp_id }
    }
}
