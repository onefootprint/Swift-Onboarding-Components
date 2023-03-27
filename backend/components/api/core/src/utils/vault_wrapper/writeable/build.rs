use db::{models::vault::Vault, TxnPgConn};
use newtypes::{Locked, ScopedVaultId};

use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{VaultWrapper, VwArgs},
};

use super::WriteableVw;

impl<Type> VaultWrapper<Type> {
    /// Builds a locked UVW that sees portable data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// speculative data that has been added by previous operations
    pub fn lock_for_onboarding(
        conn: &mut TxnPgConn,
        scoped_user_id: &ScopedVaultId,
    ) -> ApiResult<WriteableVw<Type>> {
        // Lock the UserVault in this transaction, then build the UVW
        Vault::lock_by_scoped_user(conn, scoped_user_id)?;
        let uvw = Self::build(conn, VwArgs::Tenant(scoped_user_id))?;
        let ob_uvw = WriteableVw::<Type> {
            uvw: Locked::new(uvw),
            scoped_user_id: scoped_user_id.clone(),
        };
        Ok(ob_uvw)
    }
}
