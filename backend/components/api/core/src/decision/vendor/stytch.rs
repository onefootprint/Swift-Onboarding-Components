use super::verification_result::SaveVerificationResultArgs;
use super::verification_result::ShouldSaveVerificationRequest;
use api_errors::FpResult;
use idv::stytch::StytchLookupResponse;
use newtypes::DecisionIntentId;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;


impl SaveVerificationResultArgs {
    pub fn new_for_stytch(
        request_result: &FpResult<StytchLookupResponse>,
        di_id: DecisionIntentId,
        sv_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        let should_save_verification_request =
            ShouldSaveVerificationRequest::Yes(VendorAPI::StytchLookup, di_id, sv_id, None);
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_err();
                let raw_response = response.raw_response.clone();

                let scrubbed_response = (response.result.as_ref().ok())
                    .and_then(|res| ScrubbedPiiVendorResponse::new(res).ok())
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
