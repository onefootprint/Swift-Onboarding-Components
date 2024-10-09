use crate::models::business_owner::BusinessOwner;
use crate::TxnPgConn;
use newtypes::VaultId;

pub fn create_primary(conn: &mut TxnPgConn, uv_id: &VaultId, bv_id: &VaultId) -> BusinessOwner {
    BusinessOwner::create_primary(conn, uv_id.clone(), bv_id.clone()).unwrap()
}
