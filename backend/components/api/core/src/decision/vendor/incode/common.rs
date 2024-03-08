use db::{
    models::{
        verification_request::{NewVerificationRequestArgs, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbPool,
};
use idv::incode::{IncodeClientErrorCustomFailureReasons, IncodeResponse};
use newtypes::{
    DecisionIntentId, IdentityDocumentId, PiiJsonValue, ScopedVaultId, ScrubbedPiiJsonValue, VaultPublicKey,
    VendorAPI, VerificationRequestId, VerificationResultId,
};

use crate::{
    decision::vendor::verification_result::encrypt_verification_result_response, errors::ApiResult, ApiError,
};

use super::IncodeContext;


// For some Incode APIs we save the VReq first still (e.g. IncodeWatchlistCheck)
pub enum ShouldSaveVerificationRequest {
    Yes(VendorAPI),
    No(VerificationRequestId),
}
/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
pub struct SaveVerificationResultArgs {
    is_error: bool,
    raw_response: PiiJsonValue,
    scrubbed_response: ScrubbedPiiJsonValue,
    vault_public_key: VaultPublicKey,
    should_save_verification_request: ShouldSaveVerificationRequest,
    decision_intent_id: DecisionIntentId,
    scoped_vault_id: ScopedVaultId,
    identity_document_id: Option<IdentityDocumentId>,
}

impl SaveVerificationResultArgs {
    pub fn new<T>(
        request_result: &Result<IncodeResponse<T>, idv::incode::error::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        identity_document_id: Option<IdentityDocumentId>,
        vault_public_key: VaultPublicKey,
        should_save_verification_request: ShouldSaveVerificationRequest,
    ) -> Self
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
    {
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();
                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(map_to_api_err)
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id,
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
                identity_document_id,
            },
        }
    }

    pub fn from<'a, T>(
        request_result: &'a Result<IncodeResponse<T>, idv::incode::error::Error>,
        // TODO make VendorAPI a function of T
        vendor_api: VendorAPI,
        ctx: &'a IncodeContext,
    ) -> Self
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
    {
        // We need to handle saving if
        // 1) if the Incode call fails (for some reason)
        // 2) if the Incode response succeeds but there's an error returned
        let decision_intent_id = ctx.di_id.clone();
        let vault_public_key = ctx.vault.public_key.clone();
        let scoped_vault_id = ctx.sv_id.clone();
        let identity_document_id = Some(ctx.id_doc_id.clone());
        Self::new(
            request_result,
            decision_intent_id,
            scoped_vault_id,
            identity_document_id,
            vault_public_key,
            ShouldSaveVerificationRequest::Yes(vendor_api),
        )
    }
}

pub async fn save_incode_verification_result(
    db_pool: &DbPool,
    args: SaveVerificationResultArgs,
) -> ApiResult<(VerificationResultId, VerificationRequestId)> {
    let SaveVerificationResultArgs {
        scrubbed_response,
        raw_response,
        is_error,
        should_save_verification_request,
        decision_intent_id,
        vault_public_key,
        scoped_vault_id,
        identity_document_id,
    } = args;
    let e_response = encrypt_verification_result_response(&raw_response, &vault_public_key)?;
    let result = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // This is interesting - we make the VReq and VRes at the same time.
            // In other vendor APIs, the only bookkeeping we have for an outstanding vendor request
            // is a VReq without a VRes - for the document workflow, we have the incode state
            // machine that tells us what state we're in.
            let vreq_id = match should_save_verification_request {
                ShouldSaveVerificationRequest::Yes(vendor_api) => {
                    let args = NewVerificationRequestArgs {
                        scoped_vault_id: &scoped_vault_id,
                        identity_document_id: identity_document_id.as_ref(),
                        decision_intent_id: &decision_intent_id,
                        vendor_api,
                    };
                    let vreq = VerificationRequest::create(conn, args)?;
                    vreq.id
                }
                ShouldSaveVerificationRequest::No(vreq_id) => vreq_id,
            };
            let res =
                VerificationResult::create(conn, vreq_id.clone(), scrubbed_response, e_response, is_error)?;

            Ok((res.id, vreq_id))
        })
        .await?;
    Ok(result)
}

pub fn map_to_api_err(e: idv::incode::error::Error) -> ApiError {
    ApiError::from(idv::Error::from(e))
}
