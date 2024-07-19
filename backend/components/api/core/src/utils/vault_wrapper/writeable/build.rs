use super::WriteableVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::TxnPgConn;
use newtypes::Locked;
use newtypes::ScopedVaultId;

impl<Type> VaultWrapper<Type> {
    /// Builds a locked UVW that sees portable data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// speculative data that has been added by previous operations
    pub fn lock_for_onboarding(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> FpResult<WriteableVw<Type>> {
        // Lock the UserVault in this transaction, then build the UVW
        let sv = ScopedVault::lock(conn, scoped_vault_id)?;
        let uvw = Self::build(conn, VwArgs::Tenant(scoped_vault_id))?;
        let ob_uvw = WriteableVw::<Type> {
            uvw: Locked::new(uvw),
            sv: sv.into_inner(),
        };
        Ok(ob_uvw)
    }
}
