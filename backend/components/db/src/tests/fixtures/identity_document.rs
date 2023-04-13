use std::str::FromStr;

use crate::{models::identity_document::IdentityDocument, TxnPgConn};
use newtypes::{DocumentRequestId, IdDocKind, SealedVaultDataKey};

pub fn create(conn: &mut TxnPgConn) -> IdentityDocument {
    IdentityDocument::create(
        conn,
        DocumentRequestId::from_str("test_derp").unwrap(),
        IdDocKind::DriverLicense,
        "Flerp country code".to_owned(),
        SealedVaultDataKey(vec![]),
        None,
        None,
        None,
    )
    .unwrap()
}
