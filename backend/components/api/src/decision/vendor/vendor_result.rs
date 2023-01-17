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
                    newtypes::VendorAPI::IdologyScanVerifySubmission => {
                        ParsedResponse::from_idology_scan_verify_submission(result.response.clone())?
                    }
                    newtypes::VendorAPI::IdologyScanVerifyResults => {
                        ParsedResponse::from_idology_scan_verify_results(result.response.clone())?
                    }
                    newtypes::VendorAPI::TwilioLookupV2 => {
                        ParsedResponse::from_twilio_lookupv2_response(result.response.clone())?
                    }
                    newtypes::VendorAPI::SocureIDPlus => {
                        ParsedResponse::from_socure_idplus_response(result.response.clone())?
                    }
                    newtypes::VendorAPI::IdologyScanOnboarding => {
                        ParsedResponse::from_idology_scan_onboarding(result.response.clone())?
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
