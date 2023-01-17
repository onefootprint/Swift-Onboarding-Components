use crate::models::{
    document_request::{DocumentRequest, DocumentRequestUpdate},
    identity_document::IdentityDocument,
    verification_request::VerificationRequest,
    verification_result::VerificationResult,
};
use crate::tests::prelude::*;
use macros::db_test;
use newtypes::{
    DocumentRequestStatus, OnboardingId, ScopedUserId, SealedVaultDataKey, UserVaultId, VendorAPI,
};

use super::prelude::TestPgConnection;

#[db_test]
fn test_get_latest_verification_result(conn: &mut TestPgConnection) {
    let uv_id = UserVaultId::from("uv1".to_string());
    let su_id: ScopedUserId = "su1".to_string().into();

    // Create the first document request -> id doc -> verification request -> verification result
    let dr1 = DocumentRequest::create(conn.conn(), su_id.clone(), None, false, None).unwrap();
    let id1 = IdentityDocument::create(
        conn,
        dr1.id.clone(),
        &uv_id,
        None,
        None,
        None,
        newtypes::IdDocKind::DriverLicense,
        "USA".into(),
        Some(&su_id),
        SealedVaultDataKey(vec![]),
    )
    .unwrap();
    let vr1 = VerificationRequest::create_document_verification_request(
        conn,
        VendorAPI::IdologyScanOnboarding,
        OnboardingId::from("ob1".to_string()),
        id1.id,
    )
    .unwrap();
    let vr1_result =
        VerificationResult::create(conn, vr1.id, serde_json::json!({"test": "response"})).unwrap();
    let update = DocumentRequestUpdate::idv_reqs_initiated();
    let dr1 = dr1.update(conn.conn(), update).unwrap();
    let update = DocumentRequestUpdate::status(DocumentRequestStatus::Uploaded);
    let dr1 = dr1.update(conn.conn(), update).unwrap();

    // Now create second one
    let dr2 = DocumentRequest::create(conn.conn(), su_id.clone(), None, false, Some(dr1.id)).unwrap();

    let (latest_doc, previous_result) =
        DocumentRequest::get_latest_with_verification_result(conn.conn(), &su_id).unwrap();

    // Assert everything worked
    assert_eq!(latest_doc.id, dr2.id);
    assert_eq!(vr1_result.id, previous_result.unwrap().id);
}
