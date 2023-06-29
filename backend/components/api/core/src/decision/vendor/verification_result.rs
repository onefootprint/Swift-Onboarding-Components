use std::slice;

use crate::{enclave_client::EnclaveClient, errors::ApiError};
use chrono::Utc;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::{
    models::{
        verification_request::VerificationRequest,
        verification_result::{NewVerificationResult, VerificationResult},
    },
    DbError, PgConn,
};
use newtypes::{EncryptedVaultPrivateKey, PiiJsonValue, ScrubbedJsonValue, SealedVaultBytes, VaultPublicKey};

use super::make_request::VerificationRequestWithVendorResponse;

/// Save a verification result, encrypting the response payload in the process
pub fn save_verification_results(
    conn: &mut PgConn,
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
                is_error: false,
            })
        })
        .collect::<Result<Vec<NewVerificationResult>, ApiError>>()?;

    Ok(VerificationResult::bulk_create(conn, new_verification_results)?)
}

/// Save a verification result for an errored VRes, encrypting the response payload in the process (if we got one back)
/// For requests with no response payload, we will notate on VRes that the request was an error
pub fn save_error_verification_results(
    conn: &mut PgConn,
    vendor_responses_with_errors: &[(VerificationRequest, Option<serde_json::Value>)],
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<Vec<VerificationResult>, ApiError> {
    let now = Utc::now();
    let new_verification_results: Vec<NewVerificationResult> = vendor_responses_with_errors
        .iter()
        .map(|(req, response)| {
            // TODO: should just make response optional for is_error
            let r = response.clone().unwrap_or(serde_json::json!(""));
            let e_response = encrypt_verification_result_response(&r.clone().into(), user_vault_public_key)?;

            Ok(NewVerificationResult {
                request_id: req.id.clone(),
                response: ScrubbedJsonValue(r),
                timestamp: now,
                e_response: Some(e_response),
                is_error: true,
            })
        })
        .collect::<Result<Vec<NewVerificationResult>, ApiError>>()?;

    Ok(VerificationResult::bulk_create(conn, new_verification_results)?)
}

pub fn save_verification_result(
    conn: &mut PgConn,
    vendor_response: &VerificationRequestWithVendorResponse,
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<VerificationResult, ApiError> {
    save_verification_results(conn, slice::from_ref(vendor_response), user_vault_public_key)?
        .pop()
        .ok_or(ApiError::from(DbError::IncorrectNumberOfRowsUpdated))
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
        .batch_decrypt_to_piibytes(
            sealed_data
                .into_iter()
                .map(|sealed| (sealed, vec![]))
                .collect(),
            sealed_key,
        )
        .await?
        .into_iter()
        .map(|b| PiiJsonValue::try_from(b).map_err(ApiError::from))
        .collect()
}
