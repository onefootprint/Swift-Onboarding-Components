use crate::{
    models::tenant_role::{ImmutableRoleKind, TenantRole},
    TxnPgConn,
};
use newtypes::TenantId;

pub fn create_ro(conn: &mut TxnPgConn, tenant_id: &TenantId) -> TenantRole {
    TenantRole::get_or_create_immutable(conn, tenant_id, ImmutableRoleKind::ReadOnly)
        .expect("Couldn't create RO role")
}
