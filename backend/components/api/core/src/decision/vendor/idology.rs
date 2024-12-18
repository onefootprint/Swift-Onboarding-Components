use super::verification_result::SaveVerificationResultArgs;
use super::verification_result::ShouldSaveVerificationRequest;
use idv::idology::pa::IdologyPaAPIResponse;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::VaultPublicKey;


impl SaveVerificationResultArgs {
    pub fn new_for_idology<E>(
        request_result: &Result<IdologyPaAPIResponse, E>,
        vault_public_key: VaultPublicKey,
        should_save_verification_request: ShouldSaveVerificationRequest,
    ) -> Self {
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
