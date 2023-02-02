use newtypes::{ObConfigurationId, UserVaultId};

use crate::{
    models::{scoped_user::ScopedUser, user_vault::UserVault},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &UserVaultId, ob_config_id: &ObConfigurationId) -> ScopedUser {
    let uv = UserVault::lock(conn, uv_id).unwrap();
    ScopedUser::get_or_create(conn, &uv, ob_config_id.clone()).unwrap()
}
