use newtypes::{ObConfigurationId, VaultId};

use crate::{
    models::{scoped_user::ScopedUser, vault::Vault},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, ob_config_id: &ObConfigurationId) -> ScopedUser {
    let uv = Vault::lock(conn, uv_id).unwrap();
    ScopedUser::get_or_create(conn, &uv, ob_config_id.clone()).unwrap()
}
