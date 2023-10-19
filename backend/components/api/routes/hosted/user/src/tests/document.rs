// use api_wire_types::{DocumentImageError, DocumentResponseStatus};
// use db::tests::fixtures as db_fixtures;
// use db::tests::prelude::*;
// use idv::test_fixtures as idv_fixtures;
// use macros::db_test;
// use newtypes::idology::IdologyScanOnboardingCaptureResult;
// use newtypes::DocumentRequestStatus;

// use crate::user::document::construct_get_response;

// #[db_test]
// fn test_construct_get_response_pending(conn: &mut TestPgConn) {
//     // This test we test that a fresh DocumentRequest in pending returns pending
//     let dr_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         collected_doc_opts: db_fixtures::document_request::CollectedDocOpts { ..Default::default() },
//         desired_status: DocumentRequestStatus::Pending,
//         ..Default::default()
//     };
//     let su_id = dr_opts.scoped_user_id.clone();
//     db_fixtures::document_request::create(conn, dr_opts);

//     let (status, errors) = construct_get_response(conn, &su_id).unwrap();
//     assert_eq!(status, DocumentResponseStatus::Pending);
//     assert_eq!(errors, vec![]);
// }

// #[db_test]
// fn test_construct_get_response_with_errors(conn: &mut TestPgConn) {
//     // This test we test that if scan onboarding returns errors in the response, we handle
//     let dr1_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         collected_doc_opts: db_fixtures::document_request::CollectedDocOpts {
//             id_doc_collected: true,
//             has_verification_result: true,
//             verification_result_response: idv_fixtures::scan_onboarding_fake_response(
//                 IdologyScanOnboardingCaptureResult::Completed,
//                 // Error value in the response
//                 Some(vec!["Image Too Small", "Face Image Not Detected"]),
//             ),
//         },
//         desired_status: DocumentRequestStatus::Failed,
//         ..Default::default()
//     };
//     let su_id = dr1_opts.scoped_user_id.clone();

//     let (dr_previous, _) = db_fixtures::document_request::create(conn, dr1_opts);

//     // Create the second Doc Req (in pending)
//     let dr2_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         previous_document_request_id: Some(dr_previous.id),
//         scoped_user_id: su_id.clone(),
//         desired_status: DocumentRequestStatus::Pending,
//         ..Default::default()
//     };
//     db_fixtures::document_request::create(conn, dr2_opts);

//     let (status, errors) = construct_get_response(conn, &su_id).unwrap();
//     assert_eq!(status, DocumentResponseStatus::Error);
//     assert_eq!(
//         errors,
//         vec![
//             DocumentImageError::ImageTooSmall,
//             DocumentImageError::FaceImageNotDetected
//         ]
//     )
// }

// #[db_test]
// fn test_construct_get_response_with_capture_errors(conn: &mut TestPgConn) {
//     // This test we test that if scan onboarding returns a capture error result
//     let dr1_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         collected_doc_opts: db_fixtures::document_request::CollectedDocOpts {
//             id_doc_collected: true,
//             has_verification_result: true,
//             verification_result_response: idv_fixtures::scan_onboarding_fake_response(
//                 IdologyScanOnboardingCaptureResult::InternalError,
//                 None,
//             ),
//         },
//         desired_status: DocumentRequestStatus::Failed,
//         ..Default::default()
//     };
//     let su_id = dr1_opts.scoped_user_id.clone();

//     let (dr_previous, _) = db_fixtures::document_request::create(conn, dr1_opts);

//     // Create the second Doc Req
//     let dr2_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         previous_document_request_id: Some(dr_previous.id),
//         scoped_user_id: su_id.clone(),
//         desired_status: DocumentRequestStatus::Pending,
//         ..Default::default()
//     };
//     db_fixtures::document_request::create(conn, dr2_opts);

//     let (status, errors) = construct_get_response(conn, &su_id).unwrap();
//     assert_eq!(status, DocumentResponseStatus::Error);
//     assert_eq!(errors, vec![DocumentImageError::ImageError])
// }

// #[db_test]
// fn test_construct_get_response_retry_limit_exceeded_failed(conn: &mut TestPgConn) {
//     // This test we test that we handle retries being exceeded
//     let dr1_opts = db_fixtures::document_request::DocumentRequestFixtureCreateOpts {
//         collected_doc_opts: db_fixtures::document_request::CollectedDocOpts {
//             id_doc_collected: true,
//             has_verification_result: true,
//             verification_result_response: idv_fixtures::scan_onboarding_fake_response(
//                 IdologyScanOnboardingCaptureResult::InternalError,
//                 None,
//             ),
//         },
//         desired_status: DocumentRequestStatus::Failed,
//         ..Default::default()
//     };
//     let su_id = dr1_opts.scoped_user_id.clone();
//     // Fail 3 images
//     db_fixtures::document_request::create(conn, dr1_opts.clone());
//     db_fixtures::document_request::create(conn, dr1_opts.clone());
//     let mut upload_failed_opts = dr1_opts;
//     upload_failed_opts.desired_status = DocumentRequestStatus::UploadFailed;
//     db_fixtures::document_request::create(conn, upload_failed_opts);

//     let (status, errors) = construct_get_response(conn, &su_id).unwrap();
//     assert_eq!(status, DocumentResponseStatus::RetryLimitExceeded);
//     assert_eq!(errors, vec![])
// }
