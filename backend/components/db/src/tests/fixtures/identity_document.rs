use std::str::FromStr;

use crate::{models::identity_document::IdentityDocument, TxnPgConn};
use newtypes::{DocumentRequestId, IdDocKind, ScopedVaultId, SealedVaultDataKey, VaultId};

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, su_id: &ScopedVaultId) -> IdentityDocument {
    IdentityDocument::create(
        conn,
        DocumentRequestId::from_str("test_derp").unwrap(),
        uv_id,
        None,
        None,
        None,
        IdDocKind::DriverLicense,
        "Flerp country code".to_owned(),
        su_id,
        SealedVaultDataKey(vec![]),
    )
    .unwrap()
}
