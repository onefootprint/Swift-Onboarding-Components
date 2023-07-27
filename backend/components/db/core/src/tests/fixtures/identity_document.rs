use std::str::FromStr;

use crate::{
    models::{
        data_lifetime::DataLifetime,
        document_upload::DocumentUpload,
        identity_document::{IdentityDocument, NewIdentityDocumentArgs},
    },
    TxnPgConn,
};
use newtypes::{DocumentRequestId, DocumentSide, ModernIdDocKind, S3Url, SealedVaultDataKey};

pub fn create(conn: &mut TxnPgConn, request_id: Option<DocumentRequestId>) -> IdentityDocument {
    let args = NewIdentityDocumentArgs {
        request_id: request_id.unwrap_or_else(|| DocumentRequestId::from_str("test_derp").unwrap()),
        document_type: ModernIdDocKind::DriversLicense,
        country_code: "Flerp country code".to_owned(),
        fixture_result: None,
    };
    let doc = IdentityDocument::get_or_create(conn, args).unwrap();
    let key = SealedVaultDataKey(vec![]);
    let s3_url = S3Url::test_data("".into());
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    DocumentUpload::create(conn, doc.id.clone(), DocumentSide::Front, s3_url, key, seqno).unwrap();
    doc
}
