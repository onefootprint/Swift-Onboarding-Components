use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::user::documents::process::handle_incode_request;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{decision, State};
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use actix_web::{http::header::HeaderMap, FromRequest};
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use api_core::decision::vendor;
use api_core::decision::vendor::incode::states::{save_incode_fixtures, Complete};
use api_core::telemetry::RootSpan;
use api_core::types::JsonApiResponse;
use api_core::utils::file_upload::handle_file_upload;
use api_core::utils::headers::get_bool_header;
use api_core::utils::vault_wrapper::{seal_file_and_upload_to_s3, Person, VwArgs};
use api_wire_types::DocumentResponse;
use db::models::decision_intent::DecisionIntent;
use db::models::document_upload::{DocumentUpload, NewDocumentUploadArgs};
use db::models::identity_document::IdentityDocument;
use db::models::ob_configuration::ObConfiguration;
use db::models::user_consent::UserConsent;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::TxnPgConn;
use futures_util::Future;
use itertools::Itertools;
use newtypes::{
    DataIdentifier, DataLifetimeSource, DecisionIntentKind, DocumentKind, DocumentSide, IdentityDocumentId,
    IdentityDocumentStatus, WorkflowId,
};
use newtypes::{ScopedVaultId, VendorAPI, WorkflowGuard};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web};
use std::pin::Pin;

#[derive(Debug, Apiv2Schema)]
pub struct MetaHeaders {
    pub is_instant_app: Option<bool>,
    pub is_app_clip: Option<bool>,
    /// When true, photo was taken manually
    pub is_manual: Option<bool>,
    pub process_separately: Option<bool>,
    pub is_extra_compressed: bool,
}

impl MetaHeaders {
    const IS_INSTANT_APP_HEADER_NAME: &str = "x-fp-is-instant-app";
    const IS_APP_CLIP_HEADER_NAME: &str = "x-fp-is-app-clip";
    const IS_MANUAL_HEADER_NAME: &str = "x-fp-is-manual";
    const PROCESS_SEPARATELY_HEADER_NAME: &str = "x-fp-process-separately";
    const IS_EXTRA_COMPRESSED: &str = "x-fp-is-extra-compressed";

    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let is_instant_app = get_bool_header(Self::IS_INSTANT_APP_HEADER_NAME, headers);
        let is_app_clip = get_bool_header(Self::IS_APP_CLIP_HEADER_NAME, headers);
        let is_manual = get_bool_header(Self::IS_MANUAL_HEADER_NAME, headers);
        let process_separately = get_bool_header(Self::PROCESS_SEPARATELY_HEADER_NAME, headers);
        let is_extra_compressed = get_bool_header(Self::IS_EXTRA_COMPRESSED, headers).unwrap_or(false);
        Self {
            is_instant_app,
            is_app_clip,
            is_manual,
            process_separately,
            is_extra_compressed,
        }
    }
}

impl FromRequest for MetaHeaders {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = MetaHeaders::parse_from_request(req.headers());
        Box::pin(async move { Ok(headers) })
    }
}

#[api_v2_operation(
    description = "Upload an image for the given side to the provided ID doc.",
    tags(Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/upload/{side}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    args: web::Path<(IdentityDocumentId, DocumentSide)>,
    mut payload: Multipart,
    request: HttpRequest,
    meta: MetaHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<DocumentResponse> {
    let file = handle_file_upload(&mut payload, &request, None, 5_242_880).await?;

    let (document_id, side) = args.into_inner();
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let wf = user_auth.workflow();
    let wf_id = wf.id.clone();
    let su_id = user_auth.scoped_user.id.clone();
    let (id_doc, doc_request, uvw, user_consent, obc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (id_doc, doc_request) = IdentityDocument::get(conn, &document_id)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            let user_consent = UserConsent::get_for_workflow(conn, &wf_id)?;
            Ok((id_doc, doc_request, uvw, user_consent, obc))
        })
        .await??;
    let vault = uvw.vault.clone();
    // We support the flow
    let should_collect_selfie = doc_request.should_collect_selfie && !id_doc.should_skip_selfie();

    if side == DocumentSide::Selfie && !should_collect_selfie {
        return Err(OnboardingError::NotExpectingSelfie.into());
    }

    if user_consent.is_none() {
        return Err(OnboardingError::UserConsentNotFound.into());
    }

    // Upload the image to s3
    let di = DataIdentifier::from(DocumentKind::LatestUpload(id_doc.document_type, side));
    let su_id = user_auth.scoped_user.id.clone();
    let (e_data_key, s3_url) =
        seal_file_and_upload_to_s3(&state, &file, di.clone(), user_auth.user(), &su_id).await?;

    // Create uploads for the document
    let vault2 = vault.clone();
    let wf_id = wf.id.clone();
    let wf_id2 = wf.id.clone();
    let is_sandbox = id_doc.fixture_result.is_some();
    // Check if we should be initiating requests (e.g. check if we are testing)
    let (should_initiate_reqs, ocr_fixture) =
        decision::utils::should_initiate_requests_for_document(&state, &uvw, id_doc.fixture_result).await?;

    let (missing_sides, created_reqs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;
            if id_doc.status != IdentityDocumentStatus::Pending {
                return Err(OnboardingError::IdentityDocumentNotPending.into());
            }
            // Vault the images under latest uploads

            let source = DataLifetimeSource::Hosted;
            let (d, seqno) = uvw.put_document_unsafe(
                conn,
                di,
                file.mime_type,
                file.filename,
                e_data_key,
                s3_url,
                source,
            )?;
            let args = NewDocumentUploadArgs {
                document_id: id_doc.id.clone(),
                side,
                s3_url: d.s3_url,
                e_data_key: d.e_data_key,
                created_seqno: seqno,
                is_instant_app: meta.is_instant_app,
                is_app_clip: meta.is_app_clip,
                is_manual: meta.is_manual,
                is_extra_compressed: meta.is_extra_compressed,
            };
            DocumentUpload::create(conn, args)?;
            let existing_sides = id_doc
                .images(conn, true)?
                .into_iter()
                .map(|u| u.side)
                .collect_vec();
            let required_sides = id_doc
                .document_type
                .sides()
                .into_iter()
                .chain(should_collect_selfie.then_some(DocumentSide::Selfie))
                .collect_vec();
            let missing_sides = required_sides
                .into_iter()
                .filter(|s| !existing_sides.contains(s))
                .collect_vec();

            // Now that the document is created, either initiate IDV reqs or create fixture data
            let result = if should_initiate_reqs {
                // Initiate IDV reqs once and only once for this id_doc
                let decision_intent = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &su_id,
                    &wf_id,
                    DecisionIntentKind::DocScan,
                )?;

                let attempts_for_side = DocumentUpload::count_failed_attempts(conn, &id_doc.id)?
                    .iter()
                    .filter_map(|(s, n)| (side == *s).then_some(*n))
                    .next();
                Some((decision_intent, doc_request, id_doc.id, attempts_for_side))
            } else {
                // TODO could move this into process
                if missing_sides.is_empty() {
                    // Create fixture data once all of the sides are uploaded
                    let ocr =
                        idv::incode::doc::response::FetchOCRResponse::fixture_response(ocr_fixture.clone());
                    let ocr = serde_json::from_value(ocr)?;

                    // We need to synthetically set up a vres in order to not get db constraint errors when saving risk signals
                    let fake_score_response =
                        idv::incode::doc::response::FetchScoresResponse::fixture_response(
                            id_doc.fixture_result,
                        )
                        .map_err(idv::Error::from)?;
                    let res = serde_json::to_value(fake_score_response.clone())?;
                    let vres = save_vres_for_fixture_risk_signals(conn, &su_id, &vault2, &wf_id, res)?;
                    let id_data = (!obc.is_doc_first)
                        .then_some(ocr_fixture.unwrap_or(IncodeOcrComparisonDataFields::default()));

                    // Enter the complete state
                    Complete::enter(
                        conn,
                        &vault2,
                        &su_id,
                        &id_doc.id,
                        id_doc.document_type,
                        vec![],
                        ocr,
                        fake_score_response,
                        id_data,
                        should_collect_selfie,
                        vres.id.clone(),
                        vres.id,
                    )?;
                }
                None
            };

            Ok((missing_sides, result))
        })
        .await?;

    // Compose the API response
    let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
        .into_iter()
        .find(|s| missing_sides.contains(s));
    if meta.process_separately.unwrap_or_default() {
        // Tracing so we can query for when no requests are being sent with the old API
        tracing::info!("Processing separately");
        root_span.record("meta", "process_separately");
        // Bogus response - the client isn't reading it anymore
        let response = DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        };
        return ResponseData::ok(response).json();
    }
    root_span.record("meta", "not_process_separately");
    tracing::info!("Performing process inside upload endpoint");
    let response = if let Some((di, doc_request, id_doc_id, failed_attempts_for_side)) = created_reqs {
        // Not sandbox - make our request to vendors!
        let t_id = user_auth.scoped_user.tenant_id.clone();
        handle_incode_request(
            &state,
            id_doc_id,
            t_id,
            obc,
            di.id,
            &uvw,
            doc_request,
            is_sandbox,
            should_collect_selfie,
            &wf_id2,
            state.feature_flag_client.clone(),
            failed_attempts_for_side,
            false,
            missing_sides,
        )
        .await?
    } else {
        // Fixture response - we always complete successfully!
        if next_side_to_collect.is_none() {
            // Save fixture VRes
            save_incode_fixtures(&state, &user_auth.scoped_user.id.clone(), &wf.id).await?;
        }
        DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        }
    };
    ResponseData::ok(response).json()
}

pub(in crate::user) fn save_vres_for_fixture_risk_signals(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    vault: &Vault,
    wf_id: &WorkflowId,
    response: serde_json::Value,
) -> Result<VerificationResult, ApiError> {
    let di = DecisionIntent::get_or_create_for_workflow(conn, sv_id, wf_id, DecisionIntentKind::DocScan)?;
    let vreq = VerificationRequest::create(conn, sv_id, &di.id, VendorAPI::IncodeFetchScores)?;
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &response.clone().into(),
        &vault.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, response.into(), e_response, false)?;

    Ok(vres)
}
