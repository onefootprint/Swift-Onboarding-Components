use chrono::Utc;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::{
    models::verification_result::{NewVerificationResult, VerificationResult},
    DbPool,
};
use enclave_proxy::DataTransform;
use newtypes::{EncryptedVaultPrivateKey, PiiJsonValue, ScrubbedJsonValue, SealedVaultBytes, VaultPublicKey};

use crate::{enclave_client::EnclaveClient, errors::ApiError};

use super::make_request::VerificationRequestWithVendorResponse;

/// Save a verification result, encrypting the response payload in the process
pub async fn save_verification_result(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<Vec<VerificationResult>, ApiError> {
    let now = Utc::now();
    let new_verification_results: Vec<NewVerificationResult> = vendor_responses
        .iter()
        .map(|(req, res)| {
            // For testing rollout of footprint
            let scrubbed_json = ScrubbedJsonValue::scrub(&res.response)?;

            let e_response = encrypt_verification_result_response(&res.raw_response, user_vault_public_key)?;

            Ok(NewVerificationResult {
                request_id: req.id.clone(),
                response: scrubbed_json,
                timestamp: now,
                e_response: Some(e_response),
            })
        })
        .collect::<Result<Vec<NewVerificationResult>, ApiError>>()?;

    db_pool
        .db_query(move |conn| Ok(VerificationResult::bulk_create(conn, new_verification_results)?))
        .await?
}

// Encrypt payload using UV
pub fn encrypt_verification_result_response(
    response: &PiiJsonValue,
    user_vault_public_key: &VaultPublicKey,
) -> Result<SealedVaultBytes, ApiError> {
    user_vault_public_key
        .seal_bytes(response.leak_to_vec()?.as_slice())
        .map_err(ApiError::from)
}

// Bulk decrypt a Vec of encrypted responses
pub async fn decrypt_verification_result_response(
    enclave_client: &EnclaveClient,
    sealed_data: Vec<SealedVaultBytes>, // sealed vault bytes
    sealed_key: &EncryptedVaultPrivateKey,
) -> Result<Vec<PiiJsonValue>, ApiError> {
    let sealed_data: Vec<_> = sealed_data
        .iter()
        .map(|b| EciesP256Sha256AesGcmSealed::from_bytes(b.as_ref()))
        .collect::<Result<_, _>>()?;

    enclave_client
        .batch_decrypt_to_piibytes(sealed_data, sealed_key, DataTransform::Identity)
        .await?
        .into_iter()
        .map(|b| PiiJsonValue::try_from(b).map_err(ApiError::from))
        .collect()
}
