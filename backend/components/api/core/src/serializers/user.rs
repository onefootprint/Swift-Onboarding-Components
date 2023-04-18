use crate::utils::db2api::DbToApi;
use db::models::scoped_vault::ScopedVault;

impl DbToApi<ScopedVault> for api_wire_types::NewUser {
    fn from_db(target: ScopedVault) -> Self {
        // Used in POST /users when we create a new vault-only user
        let ScopedVault { fp_id, .. } = target;

        Self { id: fp_id }
    }
}
