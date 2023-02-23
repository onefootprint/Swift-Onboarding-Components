use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::{models::verification_result::VerificationResult, DbPool};
use enclave_proxy::DataTransform;
use idv::VendorResponse;
use newtypes::{
    EncryptedVaultPrivateKey, PiiJsonValue, ScrubbedJsonValue, SealedVaultBytes, VaultPublicKey,
    VerificationRequestId,
};

use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiResult},
};

/// Save a verification result, encrypting the response payload in the process
pub(super) async fn save_verification_result(
    db_pool: &DbPool,
    verification_request_id: VerificationRequestId,
    vendor_response: VendorResponse,
    user_vault_public_key: VaultPublicKey, // passed in so unit testing is easier
) -> Result<VerificationResult, ApiError> {
    let res = db_pool
        .db_transaction(move |conn| -> ApiResult<VerificationResult> {
            // For testing rollout of footprint
            let scrubbed_json = ScrubbedJsonValue::scrub(&vendor_response.response)?;

            let e_response =
                encrypt_verification_result_response(vendor_response.raw_response, user_vault_public_key)?;

            let verification_result =
                VerificationResult::create(conn, verification_request_id, scrubbed_json, e_response)?;

            Ok(verification_result)
        })
        .await?;

    Ok(res)
}

// Encrypt payload using UV
pub fn encrypt_verification_result_response(
    response: PiiJsonValue,
    user_vault_public_key: VaultPublicKey,
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
