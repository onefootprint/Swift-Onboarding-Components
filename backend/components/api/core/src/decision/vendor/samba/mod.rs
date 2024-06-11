use super::verification_result::{
    SaveVerificationResultArgs,
    ShouldSaveVerificationRequest,
};
use crate::ApiError;
use idv::samba::SambaAPIResponse;
use newtypes::{
    DecisionIntentId,
    DocumentId,
    ScopedVaultId,
    VaultPublicKey,
    VendorAPI,
};
use serde::de::DeserializeOwned;
use serde::Serialize;

pub mod license_validation;

impl SaveVerificationResultArgs {
    pub fn new_for_samba<T>(
        request_result: &Result<SambaAPIResponse<T>, idv::samba::error::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
        vendor_api: VendorAPI,
        document_id: Option<DocumentId>,
    ) -> Self
    where
        T: DeserializeOwned + Serialize,
    {
        let should_save_verification_request = ShouldSaveVerificationRequest::Yes(vendor_api);
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();

                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(|e| ApiError::from(idv::Error::from(e)))
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id: document_id,
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
                identity_document_id: document_id,
            },
        }
    }
}
