use chrono::{NaiveDate, Utc};
use db::models::decision_intent::DecisionIntent;
use db::models::verification_request::VerificationRequest;

mod start_onboarding;

use idv::test_fixtures::DocTestOpts;
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
use crate::errors::{ApiErrorKind, ApiResult, AssertionError};
use crate::utils::vault_wrapper::{TenantVw, VaultWrapper};
use crate::{ApiError, State};
use db::models::verification_result::{NewVerificationResult, VerificationResult};
use db::DbPool;
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DataIdentifier, DecisionIntentKind, IdentityDataKind, IncodeFailureReason, IncodeVerificationSessionId,
    IncodeVerificationSessionKind, ModernIdDocKind, PiiJsonValue, PiiString, ScopedVaultId,
    ScrubbedPiiJsonValue, ScrubbedPiiString, VendorAPI, WorkflowId,
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
    scrubbed_response: ScrubbedPiiJsonValue,
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

pub async fn save_incode_fixtures(
    state: &State,
    scoped_vault_id: &ScopedVaultId,
    wf_id: &WorkflowId,
) -> ApiResult<()> {
    let suid = scoped_vault_id.clone();
    let suid2 = scoped_vault_id.clone();
    let wf_id = wf_id.clone();
    let (decision_intent, uvw): (DecisionIntent, TenantVw) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::build_for_tenant(conn, &suid)?;
            let decision_intent =
                DecisionIntent::get_or_create_for_workflow(conn, &suid, &wf_id, DecisionIntentKind::DocScan)?;

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
    let uv_public_key = uvw.vault.public_key.clone();
    let first_name = vd.rm_di(IdentityDataKind::FirstName)?;
    let last_name = vd.rm_di(IdentityDataKind::LastName)?;
    let dob = vd.rm_di(IdentityDataKind::Dob)?;
    let date_of_birth_timestamp = parse_dob(dob)?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let requests = VerificationRequest::bulk_create(
                conn,
                suid2.clone(),
                vec![VendorAPI::IncodeFetchOCR, VendorAPI::IncodeFetchScores],
                &decision_intent.id,
            )?;

            // Save OCR
            let raw_ocr_response = idv::incode::doc::response::FetchOCRResponse::fixture_response(
                Some(first_name),
                Some(last_name),
                date_of_birth_timestamp,
            );
            let e_ocr_response = vendor::verification_result::encrypt_verification_result_response(
                &raw_ocr_response.clone().into(),
                &uv_public_key,
            )?;

            // save scores
            let raw_score_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts::default());
            let e_score_response = vendor::verification_result::encrypt_verification_result_response(
                &raw_score_response.clone().into(),
                &uv_public_key,
            )?;

            let new_vres = requests
                .into_iter()
                .map(move |r| {
                    if r.vendor_api == VendorAPI::IncodeFetchOCR {
                        NewVerificationResult {
                            request_id: r.id,
                            response: raw_ocr_response.clone().into(),
                            timestamp: Utc::now(),
                            e_response: Some(e_ocr_response.clone()),
                            is_error: false,
                        }
                    } else {
                        NewVerificationResult {
                            request_id: r.id,
                            response: raw_score_response.clone().into(),
                            timestamp: Utc::now(),
                            e_response: Some(e_score_response.clone()),
                            is_error: false,
                        }
                    }
                })
                .collect();

            let _result = VerificationResult::bulk_create(conn, new_vres)?;

            Ok(())
        })
        .await?;

    Ok(())
}

/// Parses the IdDocKind from the response. Returns an Err IncodeFailureReason if we can't parse
fn parse_type_of_id(
    ctx: &IncodeContext,
    type_of_id: Option<&IncodeDocumentType>,
    country_code: Option<&ScrubbedPiiString>,
) -> ApiResult<Result<ModernIdDocKind, IncodeFailureReason>> {
    // Validate the doc type matches what the client told us (and what we validated against the
    // doc request)
    let expected_doc_type = ctx
        .docv_data
        .document_type
        .ok_or(AssertionError("Docv data has no document_type"))?;

    let Some(type_of_id) = type_of_id else {
        return Ok(Err(IncodeFailureReason::UnknownDocumentType));
    };
    let Ok(id_doc_kind) = ModernIdDocKind::try_from(type_of_id) else {
        return Ok(Err(IncodeFailureReason::UnsupportedDocumentType));
    };
    if id_doc_kind != expected_doc_type {
        return Ok(Err(IncodeFailureReason::DocTypeMismatch));
    }

    // Validate the country code what the client told us (and what we validated against the
    // doc request)
    // TODO this is horrible - the country codes we get from the client are two-letter ISO
    // while incode gives us three-letter ISO.
    // Until we have fully-fledged enum mappings from the two-letter to three-letter, just hardcode
    // the check that if the client told us it's US, we have a US document here.
    // Realistically, the only time we care about a document's country is when the tenant restricts
    // to only US
    let expected_country_is_us = ctx
        .docv_data
        .country_code
        .clone()
        .ok_or(AssertionError("Docv data has no country_code"))?
        .leak()
        == "US";
    let Some(country_code) = country_code else {
        return Ok(Err(IncodeFailureReason::UnknownCountryCode));
    };
    let country_is_us = country_code.leak() == "USA";
    if country_is_us != expected_country_is_us {
        return Ok(Err(IncodeFailureReason::CountryCodeMismatch));
    }
    Ok(Ok(id_doc_kind))
}

pub fn parse_dob(dob: PiiString) -> Result<Option<i64>, ApiError> {
    let parsed = NaiveDate::parse_from_str(dob.leak(), "%Y-%m-%d")
        .map_err(|_| ApiErrorKind::AssertionError("invalid date in fixture".into()))?
        .and_hms_milli_opt(0, 0, 0, 0)
        .map(|d| d.timestamp_millis());

    Ok(parsed)
}
