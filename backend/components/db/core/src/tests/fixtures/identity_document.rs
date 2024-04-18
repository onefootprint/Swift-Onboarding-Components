use std::str::FromStr;

use crate::{
    models::{
        data_lifetime::DataLifetime,
        document_upload::{DocumentUpload, NewDocumentUploadArgs},
        identity_document::{IdentityDocument, NewIdentityDocumentArgs},
    },
    TxnPgConn,
};
use newtypes::{DocumentRequestId, DocumentSide, IdDocKind, S3Url, SealedVaultDataKey};

pub fn create(conn: &mut TxnPgConn, request_id: Option<DocumentRequestId>) -> IdentityDocument {
    let args = NewIdentityDocumentArgs {
        request_id: request_id.unwrap_or_else(|| DocumentRequestId::from_str("test_derp").unwrap()),
        document_type: IdDocKind::DriversLicense,
        country_code: Some(newtypes::Iso3166TwoDigitCountryCode::US),
        fixture_result: None,
        skip_selfie: None,
        device_type: None,
    };
    let doc = IdentityDocument::get_or_create(conn, args).unwrap();
    let key = SealedVaultDataKey(vec![]);
    let s3_url = S3Url::test_data("".into());
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    let args = NewDocumentUploadArgs {
        document_id: doc.id.clone(),
        side: DocumentSide::Front,
        s3_url,
        e_data_key: key,
        created_seqno: seqno,
        is_instant_app: None,
        is_app_clip: None,
        is_manual: None,
        is_extra_compressed: false,
        is_upload: None,
        is_forced_upload: None,
    };
    DocumentUpload::create(conn, args).unwrap();
    doc
}
