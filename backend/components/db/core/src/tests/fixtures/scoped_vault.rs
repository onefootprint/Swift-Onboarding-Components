use crate::models::scoped_vault::ScopedVault;
use crate::models::vault::NewVaultArgs;
use crate::models::vault::Vault;
use crate::TxnPgConn;
use newtypes::DbActor;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::TenantId;
use newtypes::VaultId;

pub fn create(
    conn: &mut TxnPgConn,
    uv_id: &VaultId,
    ob_config_id: &ObConfigurationId,
) -> Locked<ScopedVault> {
    let uv = Vault::lock(conn, uv_id).unwrap();
    let sv = ScopedVault::get_or_create_for_playbook(conn, &uv, ob_config_id.clone())
        .unwrap()
        .0;

    ScopedVault::lock(conn, &sv.id).unwrap()
}

pub fn create_non_portable(
    conn: &mut TxnPgConn,
    args: NewVaultArgs,
    tenant_id: &TenantId,
) -> (Locked<ScopedVault>, Vault) {
    let (sv, vault) = ScopedVault::get_or_create_non_portable(
        conn,
        args,
        tenant_id.clone(),
        None,
        None,
        DbActor::Footprint,
    )
    .unwrap();

    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    (sv, vault)
}
