use crate::models::list_entry::ListEntry;
use crate::TxnPgConn;
use newtypes::{
    DbActor,
    ListId,
    SealedVaultBytes,
    TenantId,
};

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

pub fn create_in_memory() -> ListEntry {
    ListEntry {
        id: Default::default(),
        created_at: Default::default(),
        created_seqno: Default::default(),
        _created_at: Default::default(),
        _updated_at: Default::default(),
        deactivated_at: Default::default(),
        deactivated_seqno: Default::default(),
        list_id: Default::default(),
        actor: DbActor::Footprint,
        e_data: Default::default(),
        deactivated_by: Default::default(),
        list_entry_creation_id: Default::default(),
    }
}
