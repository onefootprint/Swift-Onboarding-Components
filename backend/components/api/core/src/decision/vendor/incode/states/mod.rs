use chrono::NaiveDate;
use db::models::decision_intent::DecisionIntent;
use db::models::verification_request::VerificationRequest;

mod start_onboarding;
use newtypes::incode::IncodeDocumentType;
pub use start_onboarding::*;

mod add_front;
pub use add_front::*;

mod add_back;
pub use add_back::*;

mod add_consent;
pub use add_consent::*;

mod add_selfie;
pub use add_selfie::*;

mod process_id;
pub use process_id::*;

mod fetch_scores;
pub use fetch_scores::*;

mod fetch_ocr;
pub use fetch_ocr::*;

mod complete;
pub use complete::*;

mod fail;
pub use fail::*;

mod get_onboarding_status;
pub use get_onboarding_status::*;

mod process_face;
pub use process_face::*;

use super::state::IncodeStateTransition;
use super::IncodeContext;
use crate::decision::vendor;
use crate::decision::vendor::verification_result::encrypt_verification_result_response;
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{TenantVw, VaultWrapper};
use crate::{ApiError, State};
use db::models::verification_result::VerificationResult;
use db::DbPool;
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DataIdentifier, IdDocKind, IdentityDataKind, IncodeFailureReason, IncodeVerificationSessionId,
    IncodeVerificationSessionKind, PiiJsonValue, ScopedVaultId, ScrubbedJsonValue, VendorAPI,
};

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub kind: IncodeVerificationSessionKind,
    pub credentials: IncodeCredentialsWithToken,
}

/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
struct SaveVerificationResultArgs<'a> {
    is_error: bool,
    raw_response: PiiJsonValue,
    scrubbed_response: ScrubbedJsonValue,
    vendor_api: VendorAPI,
    ctx: &'a IncodeContext,
}

impl<'a> SaveVerificationResultArgs<'a> {
    fn from<T: APIResponseToIncodeError + serde::Serialize>(
        request_result: &'a Result<IncodeResponse<T>, idv::incode::error::Error>,
        // TODO make VendorAPI a function of T
        vendor_api: VendorAPI,
        ctx: &'a IncodeContext,
    ) -> Self {
        // We need to handle saving if
        // 1) if the Incode call fails (for some reason)
        // 2) if the Incode response succeeds but there's an error returned
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
                    vendor_api,
                    ctx,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!("").into(),
                scrubbed_response: serde_json::json!("").into(),
                vendor_api,
                ctx,
            },
        }
    }
}

async fn save_incode_verification_result<'a>(
    db_pool: &DbPool,
    args: SaveVerificationResultArgs<'a>,
) -> ApiResult<VerificationResult> {
    let SaveVerificationResultArgs {
        scrubbed_response,
        raw_response,
        is_error,
        vendor_api,
        ctx,
    } = args;
    let e_response = encrypt_verification_result_response(&raw_response, &ctx.vault.public_key)?;
    let sv_id = ctx.sv_id.clone();
    let id_doc_id = ctx.id_doc_id.clone();
    let di_id = ctx.di_id.clone();
    let result = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // This is interesting - we make the VReq and VRes at the same time.
            // In other vendor APIs, the only bookkeeping we have for an outstanding vendor request
            // is a VReq without a VRes - for the document workflow, we have the incode state
            // machine that tells us what state we're in.
            let req = VerificationRequest::create_document_verification_request(
                conn, vendor_api, sv_id, id_doc_id, &di_id,
            )?;
            let res = VerificationResult::create(conn, req.id, scrubbed_response, e_response, is_error)?;

            Ok(res)
        })
        .await?;
    Ok(result)
}

fn map_to_api_err(e: idv::incode::error::Error) -> ApiError {
    ApiError::from(idv::Error::from(e))
}

pub async fn save_fixture_ocr(
    state: &State,
    scoped_vault_id: &ScopedVaultId,
) -> ApiResult<serde_json::Value> {
    let suid = scoped_vault_id.clone();
    let suid2 = scoped_vault_id.clone();
    let (decision_intent, uvw): (DecisionIntent, TenantVw) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::build_for_tenant(conn, &suid)?;
            let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &suid)?;

            Ok((decision_intent, vw))
        })
        .await?;

    // get first name and dob
    let mut vd = uvw
        .decrypt_unchecked(
            &state.enclave_client,
            &[
                DataIdentifier::Id(IdentityDataKind::FirstName),
                DataIdentifier::Id(IdentityDataKind::LastName),
                DataIdentifier::Id(IdentityDataKind::Dob),
            ],
        )
        .await?;
    let first_name = vd.rm(IdentityDataKind::FirstName)?;
    let last_name = vd.rm(IdentityDataKind::LastName)?;
    let dob = vd.rm(IdentityDataKind::Dob)?;
    let date_of_birth_timestamp = NaiveDate::parse_from_str(dob.leak(), "%Y-%m-%d")
        .map_err(|_| ApiError::AssertionError("invalid date in fixture".into()))?
        .and_hms_milli_opt(0, 0, 0, 0)
        .map(|d| d.timestamp_millis());

    let ocr = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let request = VerificationRequest::bulk_create(
                conn,
                suid2.clone(),
                vec![VendorAPI::IncodeFetchOCR],
                &decision_intent.id,
            )?
            .pop()
            .ok_or(ApiError::ResourceNotFound)?;
            let raw_response = idv::incode::doc::response::FetchOCRResponse::TEST_ONLY_FIXTURE(
                Some(first_name),
                Some(last_name),
                date_of_birth_timestamp,
            );

            // Verification result response is encrypted
            let uv = VerificationRequest::get_user_vault(conn.conn(), request.id.clone())?;
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw_response.clone().into(),
                &uv.public_key,
            )?;

            let _result =
                VerificationResult::create(conn, request.id, raw_response.clone().into(), e_response, false)?;

            Ok(raw_response)
        })
        .await?;

    Ok(ocr)
}

/// Parses the IdDocKind from the response. Returns an Err IncodeFailureReason if we can't parse
fn parse_type_of_id(
    ctx: &IncodeContext,
    type_of_id: Option<&IncodeDocumentType>,
) -> ApiResult<Result<IdDocKind, IncodeFailureReason>> {
    let expected_doc_type = ctx
        .docv_data
        .document_type
        .ok_or(AssertionError("Docv data has no document_type"))?;

    let Some(type_of_id) = type_of_id else {
        return Ok(Err(IncodeFailureReason::UnknownDocumentType));
    };
    let Ok(id_doc_kind) = IdDocKind::try_from(type_of_id) else {
        println!("UNSUPPORTED DOC TYPE {}", type_of_id);
        return Ok(Err(IncodeFailureReason::UnsupportedDocumentType));
    };
    if id_doc_kind != expected_doc_type {
        Ok(Err(IncodeFailureReason::DocTypeMismatch))
    } else {
        Ok(Ok(id_doc_kind))
    }
}
