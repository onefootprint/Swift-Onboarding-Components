use newtypes::{ObConfigurationId, VaultId};

use crate::{
    models::{scoped_vault::ScopedVault, vault::Vault},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, ob_config_id: &ObConfigurationId) -> ScopedVault {
    let uv = Vault::lock(conn, uv_id).unwrap();
    ScopedVault::get_or_create(conn, &uv, ob_config_id.clone()).unwrap()
}
