use super::verification_result::SaveVerificationResultArgs;
use super::verification_result::ShouldSaveVerificationRequest;
use idv::stytch::StytchLookupResponse;
use newtypes::DecisionIntentId;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;


impl SaveVerificationResultArgs {
    pub fn new_for_stytch(
        request_result: &Result<StytchLookupResponse, idv::stytch::error::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        let should_save_verification_request = ShouldSaveVerificationRequest::Yes(VendorAPI::StytchLookup);
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
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id: None,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!("").into(),
                scrubbed_response: serde_json::json!("").into(),
                should_save_verification_request,
                decision_intent_id,
                vault_public_key,
                scoped_vault_id,
                identity_document_id: None,
            },
        }
    }
}
