use crate::{enclave_client::EnclaveClient, errors::ApiError};

use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{EncryptedVaultPrivateKey, SealedVaultBytes, VerificationRequestId, VerificationResultId};

use super::verification_result::decrypt_verification_result_response;

#[derive(Clone)]
pub struct VendorResult {
    pub response: VendorResponse,
    pub verification_result_id: VerificationResultId,
    pub verification_request_id: VerificationRequestId,
}

impl VendorResult {
    pub async fn from_verification_results_for_onboarding(
        requests_and_results: Vec<(VerificationRequest, Option<VerificationResult>)>,
        enclave_client: &EnclaveClient,
        user_vault_private_key: &EncryptedVaultPrivateKey,
    ) -> Result<Vec<Self>, ApiError> {
        let requests_with_responses: Vec<(VerificationRequest, VerificationResult, SealedVaultBytes)> =
            requests_and_results
                .into_iter()
                .filter_map(|(request, result)| result.map(|r| (request, r)))
                .flat_map(|(req, res)| {
                    res.e_response
                        .as_ref()
                        .map(|e| (req.clone(), res.clone(), e.clone()))
                })
                .collect();

        let encrypted_responses: Vec<SealedVaultBytes> =
            requests_with_responses.iter().map(|t| t.2.clone()).collect();

        let decrypted_responses =
            decrypt_verification_result_response(enclave_client, encrypted_responses, user_vault_private_key)
                .await?;

        requests_with_responses
            .into_iter()
            .zip(decrypted_responses.into_iter())
            .map(
                |((request, result, _e), decrypted_response)| -> Result<VendorResult, ApiError> {
                    let parsed_response = match request.vendor_api {
                        newtypes::VendorAPI::IdologyExpectID => {
                            ParsedResponse::from_idology_expectid_response(decrypted_response.into_leak())?
                            // TODO: these should use e_response
                        }
                        newtypes::VendorAPI::IdologyScanVerifySubmission => {
                            ParsedResponse::from_idology_scan_verify_submission(
                                decrypted_response.into_leak(),
                            )?
                        }
                        newtypes::VendorAPI::IdologyScanVerifyResults => {
                            ParsedResponse::from_idology_scan_verify_results(decrypted_response.into_leak())?
                        }
                        newtypes::VendorAPI::TwilioLookupV2 => {
                            ParsedResponse::from_twilio_lookupv2_response(decrypted_response.into_leak())?
                        }
                        newtypes::VendorAPI::SocureIDPlus => {
                            ParsedResponse::from_socure_idplus_response(decrypted_response.into_leak())?
                        }
                        newtypes::VendorAPI::IdologyScanOnboarding => {
                            ParsedResponse::from_idology_scan_onboarding(decrypted_response.into_leak())?
                        }
                        newtypes::VendorAPI::IdologyPa => {
                            ParsedResponse::from_idology_pa(decrypted_response.into_leak())?
                        }
                    };
                    let res = VendorResult {
                        response: VendorResponse {
                            vendor: request.vendor,
                            response: parsed_response,
                            // When we are loading the response from DB, the response has been scrubbed
                            raw_response: result.response.into(),
                        },
                        verification_request_id: request.id,
                        verification_result_id: result.id,
                    };
                    Ok(res)
                },
            )
            .collect()
    }
}
