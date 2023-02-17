use crate::models::document_request::DocumentRequest;
use crate::tests::fixtures;
use crate::tests::prelude::*;
use macros::db_test;

use super::prelude::TestPgConn;

#[db_test]
fn test_get_latest_verification_result(conn: &mut TestPgConn) {
    let dr1_opts = fixtures::document_request::DocumentRequestFixtureCreateOpts {
        collected_doc_opts: fixtures::document_request::CollectedDocOpts {
            id_doc_collected: true,
            has_verification_result: true,
            ..Default::default()
        },
        desired_status: newtypes::DocumentRequestStatus::Complete,
        ..Default::default()
    };
    let su_id = dr1_opts.scoped_user_id.clone();

    let (dr1, verification_info) = fixtures::document_request::create(conn, dr1_opts);
    let (_, vres1) = verification_info.unwrap();

    let dr2_opts = fixtures::document_request::DocumentRequestFixtureCreateOpts {
        previous_document_request_id: Some(dr1.id.clone()),
        scoped_user_id: su_id.clone(),
        ..Default::default()
    };
    let (dr2, _) = fixtures::document_request::create(conn, dr2_opts);

    let (latest_doc, previous_doc, previous_result) =
        DocumentRequest::get_latest_with_previous_request_and_result(conn.conn(), &su_id).unwrap();

    // Assert everything worked
    assert_eq!(latest_doc.id, dr2.id);
    assert_eq!(previous_doc.unwrap().id, dr1.id);
    assert_eq!(vres1, previous_result.unwrap().id);
}
