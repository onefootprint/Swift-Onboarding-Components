use std::str::FromStr;

use newtypes::{DbActor, ListAlias, ListKind, SealedVaultDataKey, TenantId};

use crate::{models::list::List, PgConn};

pub fn create(conn: &mut PgConn, tenant_id: &TenantId) -> List {
    let nonce = crypto::random::gen_random_alphanumeric_code(10);
    List::create(
        conn,
        tenant_id,
        true,
        DbActor::Footprint,
        format!("{} {}", "Some Real Baddies", nonce).to_owned(),
        ListAlias::from_str(&format!("{}_{}", "some_real_baddies", nonce)).unwrap(),
        ListKind::EmailAddress,
        SealedVaultDataKey(vec![1, 2, 3, 2, 1]),
    )
    .unwrap()
}
