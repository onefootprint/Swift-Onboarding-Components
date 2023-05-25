use std::str::FromStr;

use crate::{
    models::{
        document_upload::DocumentUpload,
        identity_document::{IdentityDocument, NewIdentityDocumentArgs},
    },
    TxnPgConn,
};
use newtypes::{DocumentRequestId, DocumentSide, IdDocKind, SealedVaultDataKey};

pub fn create(conn: &mut TxnPgConn, request_id: Option<DocumentRequestId>) -> IdentityDocument {
    let args = NewIdentityDocumentArgs {
        request_id: request_id.unwrap_or_else(|| DocumentRequestId::from_str("test_derp").unwrap()),
        document_type: IdDocKind::DriverLicense,
        country_code: "Flerp country code".to_owned(),
    };
    let doc = IdentityDocument::get_or_create(conn, args).unwrap();
    let key = SealedVaultDataKey(vec![]);
    DocumentUpload::create(conn, doc.id.clone(), DocumentSide::Front, "".into(), key).unwrap();
    doc
}
