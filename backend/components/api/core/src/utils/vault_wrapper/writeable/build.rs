use super::WriteableVw;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use newtypes::Locked;
use newtypes::ScopedVaultId;

impl<Type> VaultWrapper<Type> {
    /// Builds a locked UVW that sees portable data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// speculative data that has been added by previous operations
    pub fn lock_for_onboarding(conn: &mut TxnPgConn, sv_id: &ScopedVaultId) -> FpResult<WriteableVw<Type>> {
        // Lock the Vault and ScopedVault in this transaction, then build the UVW
        let sv = ScopedVault::lock(conn, sv_id)?;
        let uvw = Self::build(conn, VwArgs::Tenant(sv_id))?;
        let workflows = Workflow::bulk_get_for_users(conn, vec![sv_id])?
            .remove(sv_id)
            .unwrap_or_default();
        // Wrap a TenantVw in the WriteableVw so we can share utilities
        let uvw = Locked::new(TenantVw {
            uvw,
            scoped_vault: sv.clone(),
            workflows,
        });
        let vw = WriteableVw::<Type> { uvw, sv };
        Ok(vw)
    }
}
