use crate::{enclave_client::EnclaveClient, errors::ApiError};

use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{
    EncryptedVaultPrivateKey, SealedVaultBytes, VendorAPI, VerificationRequestId, VerificationResultId,
};

use super::verification_result::decrypt_verification_result_response;

#[derive(Clone)]
pub struct VendorResult {
    pub response: VendorResponse,
    pub verification_result_id: VerificationResultId,
    pub verification_request_id: VerificationRequestId,
}

impl VendorResult {
    #[tracing::instrument(skip_all)]
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
                    let parsed_response =
                        deserialize_from_vendor_api(decrypted_response.into_leak(), request.vendor_api)?;
                    let res = VendorResult {
                        response: VendorResponse {
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

    pub fn vendor_api(&self) -> VendorAPI {
        let parsed = &self.response.response;

        parsed.into()
    }
}

/// Not all
fn deserialize_from_vendor_api(
    raw_response: serde_json::Value,
    vendor_api: VendorAPI,
) -> Result<ParsedResponse, ApiError> {
    let res = match vendor_api {
        VendorAPI::IdologyExpectID => ParsedResponse::from_idology_expectid_response(raw_response)?,
        VendorAPI::IdologyScanVerifySubmission => {
            ParsedResponse::from_idology_scan_verify_submission(raw_response)?
        }
        VendorAPI::IdologyScanVerifyResults => {
            ParsedResponse::from_idology_scan_verify_results(raw_response)?
        }
        VendorAPI::TwilioLookupV2 => ParsedResponse::from_twilio_lookupv2_response(raw_response)?,
        VendorAPI::SocureIDPlus => ParsedResponse::from_socure_idplus_response(raw_response)?,
        VendorAPI::IdologyScanOnboarding => ParsedResponse::from_idology_scan_onboarding(raw_response)?,
        VendorAPI::IdologyPa => ParsedResponse::from_idology_pa(raw_response)?,
        VendorAPI::ExperianPreciseID => ParsedResponse::from_experian_cross_core(raw_response)?,
        VendorAPI::MiddeskCreateBusiness => ParsedResponse::from_middesk_create_business(raw_response)?,
        VendorAPI::MiddeskBusinessUpdateWebhook => {
            ParsedResponse::from_middesk_business_update_webhook(raw_response)?
        }
        VendorAPI::MiddeskTinRetriedWebhook => {
            ParsedResponse::from_middesk_tin_retried_webhook(raw_response)?
        }
        VendorAPI::MiddeskGetBusiness => ParsedResponse::from_middesk_get_business(raw_response)?,
        VendorAPI::IncodeStartOnboarding => ParsedResponse::from_incode_start_response(raw_response)?,
        VendorAPI::IncodeAddFront => ParsedResponse::from_incode_add_front(raw_response)?,
        VendorAPI::IncodeAddBack => ParsedResponse::from_incode_add_back(raw_response)?,
        VendorAPI::IncodeProcessId => ParsedResponse::from_incode_process_id(raw_response)?,
        VendorAPI::IncodeFetchScores => ParsedResponse::from_incode_fetch_scores(raw_response)?,
        VendorAPI::IncodeAddPrivacyConsent => ParsedResponse::from_incode_add_privacy_consent(raw_response)?,
        VendorAPI::IncodeAddMLConsent => ParsedResponse::from_incode_add_ml_consent(raw_response)?,
        VendorAPI::IncodeFetchOCR => ParsedResponse::from_incode_fetch_ocr(raw_response)?,
        VendorAPI::IncodeAddSelfie => ParsedResponse::from_incode_add_selfie(raw_response)?,
        VendorAPI::IncodeWatchlistCheck => ParsedResponse::from_incode_watchlist_check(raw_response)?,
        VendorAPI::IncodeGetOnboardingStatus => {
            ParsedResponse::from_incode_get_onboarding_status(raw_response)?
        }
        VendorAPI::IncodeProcessFace => ParsedResponse::from_incode_process_face(raw_response)?,
    };

    Ok(res)
}
