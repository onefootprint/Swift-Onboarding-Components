use crate::models::data_lifetime::DataLifetime;
use crate::models::verification_request::RequestAndMaybeResult;
use crate::models::verification_request::VerificationRequest;
use crate::models::verification_result::VerificationResult;
use crate::test_helpers::assert_have_same_elements;
use crate::tests::prelude::*;
use macros::db_test_case;
use newtypes::DecisionIntentId;
use newtypes::PiiJsonValue;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;
use serde_json::json;
use std::str::FromStr;

#[db_test_case(vec![vec![VendorAPI::IdologyExpectId, newtypes::VendorAPI::TwilioLookupV2]], VendorAPI::ExperianPreciseId; "basic case with just 1 set of requests for an onboarding")]
#[db_test_case(vec![
    vec![VendorAPI::IdologyExpectId, newtypes::VendorAPI::TwilioLookupV2],
    vec![VendorAPI::IdologyExpectId, newtypes::VendorAPI::TwilioLookupV2],
], VendorAPI::ExperianPreciseId; "when multiple requests exist for an onboarding, the latest ones are retrieved")]
#[db_test_case(vec![
    vec![VendorAPI::IdologyExpectId, newtypes::VendorAPI::TwilioLookupV2],
    vec![VendorAPI::IdologyExpectId, newtypes::VendorAPI::TwilioLookupV2, VendorAPI::SocureIdPlus],
], VendorAPI::ExperianPreciseId; "multiple requests and addition of new vendor call")]
fn test_get_requests_and_results_for_onboarding(
    conn: &mut TestPgConn,
    input_req_res: Vec<Vec<VendorAPI>>,
    erroring_api: VendorAPI,
) {
    let su_id = ScopedVaultId::from_str("def456").unwrap();
    let di_id = DecisionIntentId::from_str("di_123").unwrap();
    // To advance the seqno for every set of requests

    // Creates VerificationRequest / VerificationResult's for each of the input's. Every Vec<VendorAPI>
    // will have a different (increasing) seqno
    let mut input_requests_and_results: Vec<Vec<RequestAndMaybeResult>> = input_req_res
        .into_iter()
        .map(|vendor_apis| {
            // save an erroring vres
            save_req_and_result(conn, su_id.clone(), vec![erroring_api], di_id.clone(), true);
            // return successes
            save_req_and_result(conn, su_id.clone(), vendor_apis, di_id.clone(), false)
        })
        .collect();

    // Function under test
    let queried_requests_and_results =
        VerificationRequest::get_latest_requests_and_maybe_successful_results_for_scoped_user(conn, su_id)
            .unwrap();

    // We expect the last element in the input to be what was returned
    let expected_requests_and_results = input_requests_and_results.pop().unwrap();

    let queried_ids = requests_and_responses_to_ids(queried_requests_and_results);
    let expected_ids = requests_and_responses_to_ids(expected_requests_and_results);

    assert_have_same_elements(expected_ids, queried_ids);
}
fn save_req_and_result(
    conn: &mut TestPgConn,
    su_id: ScopedVaultId,
    vendor_apis: Vec<VendorAPI>,
    di_id: DecisionIntentId,
    is_error: bool,
) -> Vec<RequestAndMaybeResult> {
    // Increment seqno for each set of requests
    DataLifetime::get_next_seqno_no_ordering_guarantee(conn).unwrap();

    let verification_requests =
        VerificationRequest::bulk_create(conn.conn(), su_id, vendor_apis, &di_id, None).unwrap();

    verification_requests
        .into_iter()
        .map(|req| {
            let result = VerificationResult::create(
                conn,
                req.id.clone(),
                json!({"yo": "sup"}).into(),
                SealedVaultBytes(PiiJsonValue::from(json!({"yo": "sup"})).leak_to_vec().unwrap()),
                is_error,
            )
            .unwrap();

            (req, Some(result))
        })
        .collect()
}
fn requests_and_responses_to_ids(
    v: Vec<RequestAndMaybeResult>,
) -> Vec<(VerificationRequestId, Option<VerificationResultId>)> {
    v.iter()
        .map(|(req, res)| (req.id.clone(), res.as_ref().map(|r| r.id.clone())))
        .collect()
}
