use chrono::Utc;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::{
    models::{
        idology_expect_id_response::{IdologyExpectIdResponse, NewIdologyExpectIdResponse},
        verification_result::VerificationResult,
    },
    DbPool, DbResult, PgConn,
};
use enclave_proxy::DataTransform;
use idv::{
    idology::{
        expectid::response::ExpectIDResponse,
        scan_onboarding::response::ScanOnboardingAPIResponse,
        scan_verify::response::{ScanVerifyAPIResponse, ScanVerifySubmissionAPIResponse},
    },
    socure::response::SocureIDPlusResponse,
    ParsedResponse, VendorResponse,
};
use newtypes::{
    EncryptedVaultPrivateKey, PiiJsonValue, SealedVaultBytes, VaultPublicKey, VerificationRequestId,
    VerificationResultId,
};
use twilio::response::lookup::LookupV2Response;

use crate::{enclave_client::EnclaveClient, errors::ApiError};

/// Save a verification result, encrypting the response payload in the process
pub(super) async fn save_verification_result(
    db_pool: &DbPool,
    verification_request_id: VerificationRequestId,
    vendor_response: VendorResponse,
    user_vault_public_key: VaultPublicKey, // passed in so unit testing is easier
) -> Result<(VerificationResult, Option<StructuredVendorResponse>), ApiError> {
    let res = db_pool
        .db_transaction(
            move |conn| -> Result<(VerificationResult, Option<StructuredVendorResponse>), ApiError> {
                // For testing rollout of footprint
                let scrubbed_json = serde_json::to_value(&vendor_response.response)?;

                let e_response = encrypt_verification_result_response(
                    vendor_response.raw_response,
                    user_vault_public_key,
                )?;

                let verification_result =
                    VerificationResult::create(conn, verification_request_id, scrubbed_json, e_response)?;
                let structured_vendor_response = vendor_response
                    .response
                    .save_vendor_response(conn, verification_result.id.clone())?;

                Ok((verification_result, structured_vendor_response))
            },
        )
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

#[derive(Clone)]
pub enum StructuredVendorResponse {
    IDologyExpectID(IdologyExpectIdResponse),
    //TODO: add other vendors
}

trait SaveStructuredVendorResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConn,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>>; //TODO: remove Option here when all structured vendor responses have been implemented
}

impl SaveStructuredVendorResponse for ExpectIDResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConn,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        let new_idology_expect_id_response = NewIdologyExpectIdResponse {
            verification_result_id,
            created_at: Utc::now(),
            id_number: self.response.id_number.and_then(|u| i64::try_from(u).ok()),
            id_scan: self.response.id_scan.clone(),
            error: self.response.error.clone(),
            results: self.response.results.as_ref().map(|r| r.key.clone()),
            summary_result: self.response.summary_result.as_ref().map(|r| r.key.clone()),
            qualifiers: self.response.raw_qualifiers(),
        };
        IdologyExpectIdResponse::create(conn, new_idology_expect_id_response)
            .map(|i| Some(StructuredVendorResponse::IDologyExpectID(i)))
    }
}

impl SaveStructuredVendorResponse for ScanVerifyAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConn,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ScanVerifySubmissionAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConn,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ScanOnboardingAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConn,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for LookupV2Response {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConn,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for SocureIDPlusResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConn,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ParsedResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConn,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        match self {
            ParsedResponse::IDologyExpectID(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::IDologyScanVerifyResult(r) => {
                r.save_vendor_response(conn, verification_result_id)
            }
            ParsedResponse::IDologyScanVerifySubmission(r) => {
                r.save_vendor_response(conn, verification_result_id)
            }
            ParsedResponse::IDologyScanOnboarding(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::TwilioLookupV2(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::SocureIDPlus(r) => r.save_vendor_response(conn, verification_result_id),
        }
    }
}
