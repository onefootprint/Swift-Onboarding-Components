use std::str::FromStr;

use crate::{models::identity_document::IdentityDocument, TxnPgConnection};
use newtypes::{DocumentRequestId, ScopedUserId, SealedVaultDataKey, UserVaultId};

pub fn create(
    conn: &mut TxnPgConnection,
    uv_id: &UserVaultId,
    su_id: Option<&ScopedUserId>,
) -> IdentityDocument {
    IdentityDocument::create(
        conn,
        DocumentRequestId::from_str("test_derp").unwrap(),
        uv_id,
        None,
        None,
        None,
        "Flerp type".to_owned(),
        "Flerp country code".to_owned(),
        su_id,
        SealedVaultDataKey(vec![]),
    )
    .unwrap()
}
