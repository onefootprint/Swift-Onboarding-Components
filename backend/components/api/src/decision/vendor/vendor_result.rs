use crate::errors::ApiError;

use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{VerificationRequestId, VerificationResultId};

#[derive(Clone)]
pub struct VendorResult {
    pub response: VendorResponse,
    pub verification_result_id: VerificationResultId,
    pub verification_request_id: VerificationRequestId,
}

impl VendorResult {
    pub fn from_verification_results_for_onboarding(
        requests_and_results: Vec<(VerificationRequest, Option<VerificationResult>)>,
    ) -> Result<Vec<Self>, ApiError> {
        let res: Result<Vec<VendorResult>, ApiError> = requests_and_results
            .into_iter()
            .filter_map(|(request, result)| result.map(|r| (request, r)))
            .map(|(request, result)| -> Result<VendorResult, ApiError> {
                let parsed_response = match request.vendor_api {
                    newtypes::VendorAPI::IdologyExpectID => {
                        ParsedResponse::from_idology_expectid_response(result.response.clone())?
                    }
                    newtypes::VendorAPI::IdologyScanVerify => todo!(),
                    newtypes::VendorAPI::TwilioLookupV2 => {
                        ParsedResponse::from_twilio_lookupv2_response(result.response.clone())?
                    }
                };
                let res = VendorResult {
                    response: VendorResponse {
                        vendor: request.vendor,
                        response: parsed_response,
                        raw_response: result.response,
                    },
                    verification_request_id: request.id,
                    verification_result_id: result.id,
                };

                Ok(res)
            })
            .collect();

        res
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::models::verification_request::VerificationRequest;
    use db::models::verification_result::VerificationResult;
    use db::test_helpers::test_db_pool;
    use newtypes::{OnboardingId, VendorAPI};
    use std::str::FromStr;

    #[tokio::test]
    async fn test_from_verification_results_for_onboarding() -> Result<(), ApiError> {
        let db_pool = test_db_pool();
        let ob_id1 = OnboardingId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
        let ob_id2 = OnboardingId::from_str("b1231b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
        //////////////////
        // Test explanation
        //////////////////
        //  - We create 2 onboardings
        //  - For OB1 we have a 2 verification requests, but only 1 verification result
        //  - For OB2 we have 1 verification request and 1 verification result
        //
        // We test:
        //  - The function returns the appropriate results per onboarding
        //  - For OB1, it ignores (gracefully) the verification request that does not have a corresponding result
        //  - For OB1, it handles requests/results from multiple vendors

        // See the note on db_test_transaction for the explanation why we use this.
        db_pool
            .db_test_transaction(move |conn| -> Result<(), ApiError> {
                // create VerificationRequests
                let ob1_requests = VerificationRequest::bulk_create(
                    conn.conn(),
                    ob_id1.clone(),
                    vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2],
                )?;
                let ob2_requests = VerificationRequest::bulk_create(
                    conn.conn(),
                    ob_id2.clone(),
                    vec![VendorAPI::TwilioLookupV2],
                )?;
                // Only create a result for the first
                let ob1_result = VerificationResult::create(
                    conn,
                    ob1_requests[0].id.clone(),
                    idv::test_fixtures::test_idology_expectid_response(),
                )?;
                let ob2_result = VerificationResult::create(
                    conn,
                    ob2_requests[0].id.clone(),
                    idv::test_fixtures::test_twilio_lookupv2_response(),
                )?;

                // Now load our requests and results
                let ob1_requests_and_results =
                    VerificationRequest::get_requests_and_results_for_onboarding(conn, ob_id1)?;
                let ob2_requests_and_results =
                    VerificationRequest::get_requests_and_results_for_onboarding(conn, ob_id2)?;

                ////////////////////////
                // Function under test
                ////////////////////////
                let ob1_vendor_result =
                    VendorResult::from_verification_results_for_onboarding(ob1_requests_and_results)?;
                let ob2_vendor_result =
                    VendorResult::from_verification_results_for_onboarding(ob2_requests_and_results)?;

                assert_eq!(1, ob1_vendor_result.len());
                assert_eq!(1, ob2_vendor_result.len());
                assert_eq!(ob1_result.id, ob1_vendor_result[0].verification_result_id);
                assert_eq!(ob2_result.id, ob2_vendor_result[0].verification_result_id);

                Ok(())
            })
            .await
            .ok();

        Ok(())
    }
}
