use super::verification_result::SaveVerificationResultArgs;
use super::verification_result::ShouldSaveVerificationRequest;
use api_errors::FpError;
use api_errors::FpResult;
use idv::sentilink::SentilinkAPIResponse;
use newtypes::DecisionIntentId;
use newtypes::ScopedVaultId;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;

pub mod application_risk;


impl SaveVerificationResultArgs {
    pub fn new_for_sentilink(
        request_result: &FpResult<SentilinkAPIResponse>,
        di_id: DecisionIntentId,
        sv_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
        vendor_api: VendorAPI,
    ) -> Self {
        let should_save_verification_request =
            ShouldSaveVerificationRequest::Yes(vendor_api, di_id, sv_id, None);
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();

                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(|e| FpError::from(idv::Error::from(e)))
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    vault_public_key,
                }
            }
            Err(_) => Self::error(should_save_verification_request, vault_public_key),
        }
    }
}
