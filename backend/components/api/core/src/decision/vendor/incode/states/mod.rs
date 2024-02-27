use std::{str::FromStr, sync::Arc};

use chrono::Utc;
use db::models::{
    decision_intent::DecisionIntent, document_upload::DocumentUpload, identity_document::IdentityDocument,
    incode_verification_session::IncodeVerificationSession, ob_configuration::ObConfiguration,
    verification_request::VerificationRequest,
};

mod start_onboarding;

use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse};
use newtypes::incode::{IncodeDocumentRestriction, IncodeDocumentSubType, IncodeDocumentType};
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

use super::{state::IncodeStateTransition, validate_doc_type_is_allowed, IncodeContext};
use crate::{
    decision::{
        features::incode_docv::IncodeOcrComparisonDataFields, vendor,
        vendor::verification_result::encrypt_verification_result_response,
    },
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::VaultWrapper,
    ApiError, State,
};
use db::{
    models::verification_result::{NewVerificationResult, VerificationResult},
    DbPool,
};
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DecisionIntentKind, IdDocKind, IncodeFailureReason,
    IncodeVerificationSessionId, IncodeVerificationSessionKind, Iso3166ThreeDigitCountryCode,
    Iso3166TwoDigitCountryCode, PiiJsonValue, ScopedVaultId, ScrubbedPiiJsonValue, ScrubbedPiiString,
    TenantId, VendorAPI, WorkflowId,
};

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub kind: IncodeVerificationSessionKind,
    pub credentials: IncodeCredentialsWithToken,
    pub ignored_failure_reasons: Vec<IncodeFailureReason>,
    pub document_type: IdDocKind,
    pub hard_errored: bool,
}

impl VerificationSession {
    pub fn refresh(self, incode_verification_session: &IncodeVerificationSession) -> Self {
        Self {
            id: self.id,
            kind: self.kind,
            credentials: self.credentials,
            ignored_failure_reasons: incode_verification_session.ignored_failure_reasons.clone(),
            document_type: self.document_type,
            hard_errored: incode_verification_session.latest_hard_error.is_some(),
        }
    }
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
    su_id: &ScopedVaultId,
    wf_id: &WorkflowId,
    obc: ObConfiguration,
    id_doc: IdentityDocument,
    should_collect_selfie: bool,
) -> ApiResult<()> {
    let wf_id = wf_id.clone();
    let suid = su_id.clone();
    let vw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &suid))
        .await?;
    let ocr_comparison_fields = if !obc.is_doc_first {
        let ocr_comparison_fields =
            IncodeOcrComparisonDataFields::compose(&state.enclave_client, &vw).await?;
        Some(ocr_comparison_fields)
    } else {
        None
    };
    let uv_public_key = vw.vault.public_key.clone();

    // Save OCR
    let raw_ocr_response = FetchOCRResponse::fixture_response(ocr_comparison_fields.clone());
    let ocr_response: FetchOCRResponse = serde_json::from_value(raw_ocr_response.clone())?;
    let e_ocr_response = vendor::verification_result::encrypt_verification_result_response(
        &raw_ocr_response.clone().into(),
        &uv_public_key,
    )?;

    // save scores
    let score_response =
        FetchScoresResponse::fixture_response(id_doc.fixture_result).map_err(idv::Error::from)?;
    let raw_score_response = serde_json::to_value(score_response.clone())?;
    let e_score_response = vendor::verification_result::encrypt_verification_result_response(
        &raw_score_response.clone().into(),
        &uv_public_key,
    )?;
    let suid = su_id.clone();
    let iddoc = id_doc.clone();
    let (vres, doc_uploads) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let di =
                DecisionIntent::get_or_create_for_workflow(conn, &suid, &wf_id, DecisionIntentKind::DocScan)?;
            let apis = vec![VendorAPI::IncodeFetchOcr, VendorAPI::IncodeFetchScores];
            let requests = VerificationRequest::bulk_create(conn, suid, apis, &di.id)?;

            let new_vres = requests
                .into_iter()
                .map(move |r| {
                    if r.vendor_api == VendorAPI::IncodeFetchOcr {
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

            let mut vrs = VerificationResult::bulk_create(conn, new_vres)?;
            let vres = vrs
                .pop()
                .ok_or(AssertionError("missing vres in incode fixture"))?;

            let doc_uploads = iddoc.images(conn, true)?;

            Ok((vres, doc_uploads))
        })
        .await?;

    let args = PreCompleteArgs {
        obc: &obc,
        id_doc: &id_doc,
        dk: id_doc.document_type,
        vw: &vw,
        expect_selfie: should_collect_selfie,
        fetch_ocr_response: &ocr_response,
        score_response: &score_response,
        doc_uploads: &doc_uploads
    };
    // Use same VRes id because fixture
    let rs = compute_risk_signals(args, ocr_comparison_fields, vres.id.clone(), vres.id, &[])?;
    let ocr_data = compute_ocr_data(&state.enclave_client, args, &rs).await?;

    let suid = su_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Enter the complete state to save risk signals
            let args = CompleteArgs {
                vault: &vw.vault,
                sv_id: &suid,
                id_doc_id: &id_doc.id,
                dk: id_doc.document_type,
                ocr_data,
                score_response,
                rs,
            };
            Complete::enter(conn, args)?;

            Ok(())
        })
        .await?;

    Ok(())
}

/// Parses the IdDocKind from the response. Returns an Err IncodeFailureReason if we can't parse
#[tracing::instrument(skip(ctx))]
fn parse_type_of_id(
    ctx: &IncodeContext,
    type_of_id: Option<&IncodeDocumentType>,
    document_sub_type: Option<&IncodeDocumentSubType>,
    country_code: Option<&ScrubbedPiiString>,
) -> ApiResult<Result<IdDocKind, IncodeFailureReason>> {
    // Validate the doc type matches what the client told us (and what we validated against the
    // doc request)
    let expected_doc_type = ctx
        .docv_data
        .document_type
        .ok_or(AssertionError("Docv data has no document_type"))?;

    let expected_country: Iso3166TwoDigitCountryCode = Iso3166TwoDigitCountryCode::from_str(
        ctx.docv_data
            .country_code
            .clone()
            .ok_or(AssertionError("Docv data has no country_code"))?
            .leak(),
    )?;

    let Some(type_of_id) = type_of_id else {
        return Ok(Err(IncodeFailureReason::UnknownDocumentType));
    };
    let Ok(id_doc_kind) = IdDocKind::try_from((type_of_id, document_sub_type)) else {
        return Ok(Err(IncodeFailureReason::UnsupportedDocumentType));
    };
    if id_doc_kind != expected_doc_type
        && validate_doc_type_is_allowed(&ctx.obc, id_doc_kind, ctx.vault_country, expected_country).is_err()
    {
        // only throw DocTypeMismatch if the Incode doc type and the user specified doc type do not match AND the Incode doc type is not supportable according to the Tenant's OBC
        return Ok(Err(IncodeFailureReason::DocTypeMismatch));
    }

    // Validate the country code what the client told us (and what we validated against the
    // doc request)

    let Some(provided_country) = country_code
        .and_then(|i| Iso3166ThreeDigitCountryCode::from_str(i.leak()).ok())
        .map(Iso3166TwoDigitCountryCode::from)
    else {
        return Ok(Err(IncodeFailureReason::UnknownCountryCode));
    };

    if expected_country != provided_country && id_doc_kind != IdDocKind::Passport {
        // TODO: maybe also check if here expected_country is allowed by OBC?
        return Ok(Err(IncodeFailureReason::CountryCodeMismatch));
    }
    Ok(Ok(id_doc_kind))
}

pub struct AddSideResponseHelper {
    pub type_of_id: Option<IncodeDocumentType>,
    pub document_subtype: Option<IncodeDocumentSubType>,
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
        ff_client: Arc<dyn FeatureFlagClient>,
        n_attempts: i64,
    ) -> Vec<IncodeDocumentRestriction> {
        let check_glare = !ff_client.flag(BoolFlag::DisableConservativeGlareForDocument(tenant_id))
            // n_attempts is 0 indexed
            && n_attempts < DocumentUpload::MAX_ATTEMPTS_BEFORE_DROPPING_GLARE_CHECK;
        let check_sharpness = !ff_client.flag(BoolFlag::DisableConservativeSharpnessForDocument(tenant_id))
            && n_attempts < DocumentUpload::MAX_ATTEMPTS_BEFORE_DROPPING_GLARE_CHECK;
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

#[cfg(test)]

mod tests {
    use std::str::FromStr;

    use db::tests::MockFFClient;
    use feature_flag::BoolFlag;
    use newtypes::{incode::IncodeDocumentRestriction, TenantId};
    use test_case::test_case;

    use super::AddSideResponseHelper;
    #[test_case(false, false, false, 0 => vec![IncodeDocumentRestriction::ConservativeGlare, IncodeDocumentRestriction::ConservativeSharpness])]
    #[test_case(true, true, true, 0 => vec![IncodeDocumentRestriction::NoDriverLicensePermit])]
    #[test_case(false, false, true, 2 => vec![IncodeDocumentRestriction::NoDriverLicensePermit])]
    #[test_case(true, true, true, 2 => vec![IncodeDocumentRestriction::NoDriverLicensePermit])]
    #[test_case(false, false, false, 1 => vec![IncodeDocumentRestriction::ConservativeGlare, IncodeDocumentRestriction::ConservativeSharpness])]
    fn test_add_side_get_restrictions(
        disable_check_glare: bool,
        disable_check_sharpness: bool,
        disallow_drivers_license_permits: bool,
        n_attempts: i64,
    ) -> Vec<IncodeDocumentRestriction> {
        let mut mock_ff_client = MockFFClient::new();
        // ¯\_(ツ)_/¯
        let t1 = TenantId::from_str("t_1234").unwrap();
        let t2 = t1.clone();
        let t3 = t1.clone();
        let t4 = t1.clone();

        mock_ff_client.mock(|c| {
            c.expect_flag()
                .times(1)
                .withf(move |f| *f == BoolFlag::DisableConservativeGlareForDocument(&t2))
                .return_once(move |_| disable_check_glare);
        });

        mock_ff_client.mock(|c| {
            c.expect_flag()
                .times(1)
                .withf(move |f| *f == BoolFlag::DisableConservativeSharpnessForDocument(&t3))
                .return_once(move |_| disable_check_sharpness);
        });

        mock_ff_client.mock(|c| {
            c.expect_flag()
                .times(1)
                .withf(move |f| *f == BoolFlag::DisallowDriverLicensePermits(&t4))
                .return_once(move |_| disallow_drivers_license_permits);
        });
        AddSideResponseHelper::get_restrictions(&t1, mock_ff_client.into_mock(), n_attempts)
    }
}
