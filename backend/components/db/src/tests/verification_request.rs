use crate::models::data_lifetime::DataLifetime;
use crate::models::verification_request::RequestAndMaybeResult;
use crate::models::verification_request::VerificationRequest;
use crate::models::verification_result::VerificationResult;
use crate::test_helpers::have_same_elements;
use crate::tests::prelude::*;
use macros::db_test_case;
use newtypes::OnboardingId;
use newtypes::PiiJsonValue;
use newtypes::SealedVaultBytes;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;
use serde_json::json;
use std::str::FromStr;

#[db_test_case(vec![vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2]]; "basic case with just 1 set of requests for an onboarding")]
#[db_test_case(vec![
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2],
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2],
]; "when multiple requests exist for an onboarding, the latest ones are retrieved")]
#[db_test_case(vec![
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2],
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus],
]; "multiple requests and addition of new vendor call")]
#[db_test_case(vec![
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::SocureIDPlus],
    vec![VendorAPI::IdologyExpectID, newtypes::VendorAPI::TwilioLookupV2],
]; "a kyc request with an unexpected earlier seqno is filtered out")]
fn test_get_requests_and_results_for_onboarding(conn: &mut TestPgConn, input_req_res: Vec<Vec<VendorAPI>>) {
    let ob_id = OnboardingId::from_str("abc123").unwrap();

    // Creates VerificationRequest / VerificationResult's for each of the input's. Every Vec<VendorAPI> will have a different (increasing) seqno
    let mut input_requests_and_results: Vec<Vec<RequestAndMaybeResult>> = input_req_res
        .into_iter()
        .map(|vendor_apis| {
            // To advance the seqno for every set of requests
            DataLifetime::get_next_seqno(conn).unwrap();
            let verification_requests =
                VerificationRequest::bulk_create(conn.conn(), ob_id.clone(), vendor_apis).unwrap();

            verification_requests
                .into_iter()
                .map(|req| {
                    let result = VerificationResult::create(
                        conn,
                        req.id.clone(),
                        json!({"yo": "sup"}).into(),
                        SealedVaultBytes(PiiJsonValue::from(json!({"yo": "sup"})).leak_to_vec().unwrap()),
                    )
                    .unwrap();

                    (req, Some(result))
                })
                .collect()
        })
        .collect();

    // Function under test
    let queried_requests_and_results =
        VerificationRequest::get_latest_requests_and_results_for_onboarding(conn, ob_id).unwrap();

    // We expect the last element in the input to be what was returned
    let expected_requests_and_results = input_requests_and_results.pop().unwrap();

    let queried_ids = requests_and_responses_to_ids(queried_requests_and_results);
    let expected_ids = requests_and_responses_to_ids(expected_requests_and_results);

    assert!(have_same_elements(expected_ids, queried_ids));
}

fn requests_and_responses_to_ids(
    v: Vec<RequestAndMaybeResult>,
) -> Vec<(VerificationRequestId, Option<VerificationResultId>)> {
    v.iter()
        .map(|(req, res)| (req.id.clone(), res.as_ref().map(|r| r.id.clone())))
        .collect()
}
