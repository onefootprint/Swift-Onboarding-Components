use std::str::FromStr;

use crate::{
    models::identity_document::{IdentityDocument, NewIdentityDocumentArgs},
    TxnPgConn,
};
use newtypes::{DocumentRequestId, IdDocKind, SealedVaultDataKey};

pub fn create(conn: &mut TxnPgConn, request_id: Option<DocumentRequestId>) -> IdentityDocument {
    let args = NewIdentityDocumentArgs {
        request_id: request_id.unwrap_or_else(|| DocumentRequestId::from_str("test_derp").unwrap()),
        document_type: IdDocKind::DriverLicense,
        country_code: "Flerp country code".to_owned(),
        e_data_key: SealedVaultDataKey(vec![]),
        front_image_s3_url: None,
        back_image_s3_url: None,
        selfie_image_s3_url: None,
    };
    IdentityDocument::create(conn, args).unwrap()
}
