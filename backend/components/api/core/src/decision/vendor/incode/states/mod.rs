use std::str::FromStr;
use std::sync::Arc;

use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::verification_request::VerificationRequest;

mod start_onboarding;

use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::test_fixtures::DocTestOpts;
use newtypes::incode::{IncodeDocumentRestriction, IncodeDocumentType};
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
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor;
use crate::decision::vendor::verification_result::encrypt_verification_result_response;
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{Person, TenantVw, VaultWrapper};
use crate::{ApiError, State};
use db::models::verification_result::{NewVerificationResult, VerificationResult};
use db::DbPool;
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DecisionIntentKind, IdDocKind, IncodeFailureReason, IncodeVerificationSessionId,
    IncodeVerificationSessionKind, Iso3166ThreeDigitCountryCode, Iso3166TwoDigitCountryCode, PiiJsonValue,
    ScopedVaultId, ScrubbedPiiJsonValue, ScrubbedPiiString, TenantId, VendorAPI, WorkflowId,
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
    let (decision_intent, uvw) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vw: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &suid)?;
            let decision_intent =
                DecisionIntent::get_or_create_for_workflow(conn, &suid, &wf_id, DecisionIntentKind::DocScan)?;

            Ok((decision_intent, vw))
        })
        .await?;
    let ocr_data = IncodeOcrComparisonDataFields::compose(&state.enclave_client, &uvw).await?;
    let uv_public_key = uvw.vault.public_key.clone();

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
            let raw_ocr_response =
                idv::incode::doc::response::FetchOCRResponse::fixture_response(Some(ocr_data));
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
) -> ApiResult<Result<IdDocKind, IncodeFailureReason>> {
    // Validate the doc type matches what the client told us (and what we validated against the
    // doc request)
    let expected_doc_type = ctx
        .docv_data
        .document_type
        .ok_or(AssertionError("Docv data has no document_type"))?;

    let Some(type_of_id) = type_of_id else {
        return Ok(Err(IncodeFailureReason::UnknownDocumentType));
    };
    let Ok(id_doc_kind) = IdDocKind::try_from(type_of_id) else {
        return Ok(Err(IncodeFailureReason::UnsupportedDocumentType));
    };
    if id_doc_kind != expected_doc_type {
        return Ok(Err(IncodeFailureReason::DocTypeMismatch));
    }

    // Validate the country code what the client told us (and what we validated against the
    // doc request)
    let expected_country: Iso3166TwoDigitCountryCode = Iso3166TwoDigitCountryCode::from_str(
        ctx.docv_data
            .country_code
            .clone()
            .ok_or(AssertionError("Docv data has no country_code"))?
            .leak(),
    )?;

    let Some(provided_country) = country_code.and_then(|i| Iso3166ThreeDigitCountryCode::from_str(i.leak()).ok()).map(Iso3166TwoDigitCountryCode::from) else {
        return Ok(Err(IncodeFailureReason::UnknownCountryCode));
    };

    if expected_country != provided_country && id_doc_kind != IdDocKind::Passport {
        return Ok(Err(IncodeFailureReason::CountryCodeMismatch));
    }
    Ok(Ok(id_doc_kind))
}

pub struct AddSideResponseHelper {
    pub type_of_id: Option<IncodeDocumentType>,
    pub country_code: Option<ScrubbedPiiString>,
    pub failure_reasons_from_response: Vec<IncodeFailureReason>,
    pub failure_reasons_from_api_error: Vec<IncodeFailureReason>,
}
impl AddSideResponseHelper {
    pub fn failure_reasons(&self) -> Vec<IncodeFailureReason> {
        self.failure_reasons_from_response
            .iter()
            .chain(self.failure_reasons_from_api_error.iter())
            .cloned()
            .collect()
    }

    pub fn has_api_error(&self) -> bool {
        !self.failure_reasons_from_api_error.is_empty()
    }

    pub fn get_restrictions(
        tenant_id: &TenantId,
        ff_client: &Arc<dyn FeatureFlagClient>,
    ) -> Vec<IncodeDocumentRestriction> {
        let check_glare = !ff_client.flag(BoolFlag::DisableConservativeGlareForDocument(tenant_id));
        let check_sharpness = !ff_client.flag(BoolFlag::DisableConservativeSharpnessForDocument(tenant_id));
        let check_dl_permit = ff_client.flag(BoolFlag::DisallowDriverLicensePermits(tenant_id));
        [
            check_glare.then_some(IncodeDocumentRestriction::ConservativeGlare),
            check_sharpness.then_some(IncodeDocumentRestriction::ConservativeSharpness),
            check_dl_permit.then_some(IncodeDocumentRestriction::NoDriverLicensePermit),
        ]
        .into_iter()
        .flatten()
        .collect()
    }
}
