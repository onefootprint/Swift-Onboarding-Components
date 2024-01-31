#![allow(unused_imports)]
use crate::decision::vendor::vendor_result::VendorResult;
use db::{
    models::{verification_request::VerificationRequest, verification_result::VerificationResult},
    tests::prelude::*,
};
use macros::db_test;
use newtypes::{PiiJsonValue, SealedVaultBytes, VendorAPI};
use std::str::FromStr;

// TODO: rebase test and re-enable after test refactoring/utils merged in (https://github.com/onefootprint/monorepo/pull/2039)
// #[db_test]
// fn test_from_verification_results_for_onboarding(conn: &mut TestPgConnection) {
//     let ob_id1 = OnboardingId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
//     let ob_id2 = OnboardingId::from_str("b1231b52-1b44-4c3a-a83f-a96796f8774d").unwrap();

//     // create VerificationRequests
//     let ob1_requests = VerificationRequest::bulk_create(
//         conn.conn(),
//         ob_id1.clone(),
//         vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2],
//     )
//     .unwrap();
//     let ob2_requests =
//         VerificationRequest::bulk_create(conn.conn(), ob_id2.clone(), vec![VendorAPI::TwilioLookupV2])
//             .unwrap();
//     // Only create a result for the first
//     let ob1_result = VerificationResult::create(
//         conn,
//         ob1_requests[0].id.clone(),
//         idv::test_fixtures::test_idology_expectid_response(),
//         SealedVaultBytes(
//             PiiJsonValue::from(idv::test_fixtures::test_idology_expectid_response())
//                 .leak_to_vec()
//                 .unwrap(),
//         ),
//     )
//     .unwrap();
//     let ob2_result = VerificationResult::create(
//         conn,
//         ob2_requests[0].id.clone(),
//         idv::test_fixtures::test_twilio_lookupv2_response(),
//         SealedVaultBytes(
//             PiiJsonValue::from(idv::test_fixtures::test_twilio_lookupv2_response())
//                 .leak_to_vec()
//                 .unwrap(),
//         ),
//     )
//     .unwrap();

//     // Now load our requests and results
//     let ob1_requests_and_results =
//         VerificationRequest::get_requests_and_results_for_onboarding(conn, ob_id1).unwrap();
//     let ob2_requests_and_results =
//         VerificationRequest::get_requests_and_results_for_onboarding(conn, ob_id2).unwrap();

// ////////////////////////
// // Function under test
// ////////////////////////
// let ob1_vendor_result =
//     VendorResult::from_verification_results_for_onboarding(ob1_requests_and_results).unwrap();
// let ob2_vendor_result =
//     VendorResult::from_verification_results_for_onboarding(ob2_requests_and_results).unwrap();

// assert_eq!(1, ob1_vendor_result.len());
// assert_eq!(1, ob2_vendor_result.len());
// assert_eq!(ob1_result.id, ob1_vendor_result[0].verification_result_id);
// assert_eq!(ob2_result.id, ob2_vendor_result[0].verification_result_id);
// }
