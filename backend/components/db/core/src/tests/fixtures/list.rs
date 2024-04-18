use crate::{models::list::List, PgConn};
use newtypes::{DbActor, ListAlias, ListKind, SealedVaultDataKey, TenantId};
use std::str::FromStr;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> List {
    let nonce = crypto::random::gen_random_alphanumeric_code(10);
    List::create(
        conn,
        tenant_id,
        is_live,
        DbActor::Footprint,
        format!("{} {}", "Some Real Baddies", nonce).to_owned(),
        ListAlias::from_str(&format!("{}_{}", "some_real_baddies", nonce)).unwrap(),
        ListKind::EmailAddress,
        SealedVaultDataKey(vec![1, 2, 3, 2, 1]),
    )
    .unwrap()
}

pub fn create_in_memory(kind: ListKind) -> List {
    List {
        id: Default::default(),
        created_at: Default::default(),
        created_seqno: Default::default(),
        _created_at: Default::default(),
        _updated_at: Default::default(),
        deactivated_at: Default::default(),
        deactivated_seqno: Default::default(),
        tenant_id: Default::default(),
        is_live: Default::default(),
        actor: DbActor::Footprint,
        name: Default::default(),
        alias: Default::default(),
        kind,
        e_data_key: Default::default(),
    }
}
