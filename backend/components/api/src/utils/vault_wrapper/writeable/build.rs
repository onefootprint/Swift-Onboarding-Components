use db::{models::vault::Vault, TxnPgConn};
use newtypes::{Locked, ScopedUserId};

use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{Person, VaultWrapper, VwArgs},
};

use super::WriteableUvw;

impl VaultWrapper<Person> {
    /// Builds a locked UVW that sees portable data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// speculative data that has been added by previous operations
    pub fn lock_for_onboarding(
        conn: &mut TxnPgConn,
        scoped_user_id: &ScopedUserId,
    ) -> ApiResult<WriteableUvw> {
        // Lock the UserVault in this transaction, then build the UVW
        Vault::lock_by_scoped_user(conn, scoped_user_id)?;
        let uvw = Self::build(conn, VwArgs::Tenant(scoped_user_id))?;
        let ob_uvw = WriteableUvw {
            uvw: Locked::new(uvw),
            scoped_user_id: scoped_user_id.clone(),
        };
        Ok(ob_uvw)
    }
}
