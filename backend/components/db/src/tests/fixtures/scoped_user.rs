use newtypes::{TenantId, UserVaultId};

use crate::{models::scoped_user::ScopedUser, TxnPgConnection};

pub fn create(conn: &mut TxnPgConnection, uv_id: &UserVaultId, tenant_id: &TenantId) -> ScopedUser {
    ScopedUser::get_or_create(conn, uv_id.clone(), tenant_id.clone(), true, None).unwrap()
}
