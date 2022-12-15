use newtypes::{ObConfigurationId, UserVaultId};

use crate::{models::scoped_user::ScopedUser, TxnPgConnection};

pub fn create(
    conn: &mut TxnPgConnection,
    uv_id: &UserVaultId,
    ob_config_id: &ObConfigurationId,
) -> ScopedUser {
    ScopedUser::get_or_create(conn, uv_id.clone(), ob_config_id.clone()).unwrap()
}
