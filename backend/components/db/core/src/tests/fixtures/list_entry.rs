use crate::{models::list_entry::ListEntry, TxnPgConn};
use newtypes::{DbActor, ListId, SealedVaultBytes, TenantId};

pub fn create(conn: &mut TxnPgConn, tenant_id: &TenantId, list_id: &ListId) -> ListEntry {
    let ie = crate::tests::fixtures::insight_event::create(conn);
    ListEntry::create(
        conn,
        list_id,
        DbActor::Footprint,
        &SealedVaultBytes(crypto::random::gen_rand_bytes(10)),
        tenant_id,
        false,
        &ie.id,
    )
    .unwrap()
}
