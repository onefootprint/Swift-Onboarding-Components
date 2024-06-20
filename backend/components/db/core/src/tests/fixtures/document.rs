use crate::models::data_lifetime::DataLifetime;
use crate::models::document::Document;
use crate::models::document::NewDocumentArgs;
use crate::models::document_upload::DocumentUpload;
use crate::models::document_upload::NewDocumentUploadArgs;
use crate::models::insight_event::CreateInsightEvent;
use crate::TxnPgConn;
use newtypes::DocumentKind;
use newtypes::DocumentRequestId;
use newtypes::DocumentSide;
use newtypes::S3Url;
use newtypes::SealedVaultDataKey;
use std::str::FromStr;

pub fn create(conn: &mut TxnPgConn, request_id: Option<DocumentRequestId>) -> Document {
    let args = NewDocumentArgs {
        request_id: request_id.unwrap_or_else(|| DocumentRequestId::from_str("test_derp").unwrap()),
        document_type: DocumentKind::DriversLicense,
        country_code: Some(newtypes::Iso3166TwoDigitCountryCode::US),
        fixture_result: None,
        skip_selfie: None,
        device_type: None,
        insight: CreateInsightEvent { ..Default::default() },
    };
    let doc = Document::get_or_create(conn, args).unwrap();
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
