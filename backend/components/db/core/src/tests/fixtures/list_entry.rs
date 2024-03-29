use crate::{models::list_entry::ListEntry, TxnPgConn};
use newtypes::{DbActor, ListId, SealedVaultBytes};

pub fn create(conn: &mut TxnPgConn, list_id: &ListId) -> ListEntry {
    ListEntry::create(
        conn,
        list_id,
        DbActor::Footprint,
        &SealedVaultBytes(crypto::random::gen_rand_bytes(10)),
    )
    .unwrap()
}
