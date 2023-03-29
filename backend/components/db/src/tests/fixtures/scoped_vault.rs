use newtypes::{ObConfigurationId, TenantId, VaultId};

use crate::{
    models::{scoped_vault::ScopedVault, vault::Vault},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, ob_config_id: &ObConfigurationId) -> ScopedVault {
    let uv = Vault::lock(conn, uv_id).unwrap();
    ScopedVault::get_or_create(conn, &uv, ob_config_id.clone()).unwrap()
}

pub fn create_non_portable(conn: &mut TxnPgConn, uv_id: &VaultId, tenant_id: &TenantId) -> ScopedVault {
    let uv = Vault::lock(conn, uv_id).unwrap();
    ScopedVault::create_non_portable(conn, uv, tenant_id.clone()).unwrap()
}
