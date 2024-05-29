use crate::models::scoped_vault::ScopedVault;
use crate::models::vault::{
    NewVaultArgs,
    Vault,
};
use crate::TxnPgConn;
use newtypes::{
    DbActor,
    ObConfigurationId,
    TenantId,
    VaultId,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, ob_config_id: &ObConfigurationId) -> ScopedVault {
    let uv = Vault::lock(conn, uv_id).unwrap();
    ScopedVault::get_or_create_for_playbook(conn, &uv, ob_config_id.clone())
        .unwrap()
        .0
}

pub fn create_non_portable(
    conn: &mut TxnPgConn,
    args: NewVaultArgs,
    tenant_id: &TenantId,
) -> (ScopedVault, Vault) {
    ScopedVault::get_or_create_non_portable(conn, args, tenant_id.clone(), None, None, DbActor::Footprint)
        .unwrap()
}
