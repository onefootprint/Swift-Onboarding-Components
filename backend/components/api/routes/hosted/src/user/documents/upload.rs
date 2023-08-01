use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::user::documents::temporary_should_skip_consent_always;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{decision, State};
use api_core::auth::user::UserObAuthContext;
use api_core::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use api_core::decision::vendor;
use api_core::decision::vendor::build_request::build_docv_data_from_identity_doc;
use api_core::decision::vendor::incode::states::{save_incode_fixtures, Complete};
use api_core::decision::vendor::incode::{get_config_id, IncodeContext, IncodeStateMachine};
use api_core::errors::workflow::WorkflowError;
use api_core::errors::AssertionError;
use api_core::types::JsonApiResponse;
use api_core::utils::file_upload::FileUpload;
use api_core::utils::large_json::LargeJson;
use api_core::utils::vault_wrapper::seal_file_and_upload_to_s3;
use api_wire_types::{CreateIdentityDocumentUploadRequest, DocumentImageError, DocumentResponse};
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::DocumentRequest;
use db::models::document_upload::DocumentUpload;
use db::models::identity_document::IdentityDocument;
use db::models::onboarding::Onboarding;
use db::models::user_consent::UserConsent;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{
    DataIdentifier, DecisionIntentId, DocumentKind, DocumentSide, IdentityDocumentId, IdentityDocumentStatus,
    IncodeVerificationSessionState, TenantId, WorkflowId,
};
use newtypes::{ScopedVaultId, VendorAPI, WorkflowGuard};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Create a new identity document for this user's outstanding document request",
    tags(Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/upload")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    document_id: web::Path<IdentityDocumentId>,
    request: LargeJson<CreateIdentityDocumentUploadRequest, 5_242_880>,
) -> JsonApiResponse<DocumentResponse> {
    tracing::info!("Starting handler");
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let wf = user_auth.workflow().ok_or(WorkflowError::AuthMissingWorkflow)?;
    let document_id: IdentityDocumentId = document_id.into_inner();
    tracing::info!("Before unpacking request");
    let CreateIdentityDocumentUploadRequest {
        image,
        side,
        mime_type,
    } = request.0;
    tracing::info!("After unpacking request");

    let su_id = user_auth.scoped_user.id.clone();
    let ob_id = user_auth.onboarding()?.id.clone();
    let (id_doc, doc_request, vault, user_consent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (id_doc, doc_request) = IdentityDocument::get(conn, &document_id)?;
            let vault = Vault::get(conn, &su_id)?;
            let user_consent = UserConsent::latest_for_onboarding(conn, &ob_id)?;
            Ok((id_doc, doc_request, vault, user_consent))
        })
        .await??;

    if side == DocumentSide::Selfie && !doc_request.should_collect_selfie {
        return Err(OnboardingError::NotExpectingSelfie.into());
    }
    // TEMPORARY until appclip supports consent always
    // if appclip enabled && sandbox && !selfie
    let temp_appclip_readiness_should_skip_consent = temporary_should_skip_consent_always(
        state.feature_flag_client.clone(),
        &user_auth.scoped_user.tenant_id,
        &vault,
        &doc_request,
    );
    if user_consent.is_none() && !temp_appclip_readiness_should_skip_consent {
        return Err(OnboardingError::UserConsentNotFound.into());
    }

    // Upload the image to s3
    let di = DataIdentifier::from(DocumentKind::LatestUpload(id_doc.document_type, side));
    let su_id = user_auth.scoped_user.id.clone();
    let image_bytes = image.try_decode_base64().map_err(crypto::Error::from)?;
    let file = FileUpload::new_simple(image_bytes, format!("{}", di), &mime_type);
    let (e_data_key, s3_url) =
        seal_file_and_upload_to_s3(&state, &file, di.clone(), user_auth.user(), &su_id).await?;

    // Check if we should be initiating requests (e.g. check if we are testing)
    let should_initiate_reqs = decision::utils::get_fixture_data_decision(
        state.feature_flag_client.clone(),
        &vault,
        wf,
        &user_auth.tenant()?.id,
    )?
    .is_none();

    // Create uploads for the document
    let ob_id = user_auth.onboarding()?.id.clone();
    let vault2 = vault.clone();
    let wf_id = wf.id.clone();
    let (missing_sides, created_reqs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;
            if id_doc.status != IdentityDocumentStatus::Pending {
                return Err(OnboardingError::IdentityDocumentNotPending.into());
            }
            // Vault the images under latest uploads
            let (d, seqno) =
                uvw.put_document_unsafe(conn, di, mime_type, file.filename, e_data_key, s3_url)?;
            DocumentUpload::create(conn, id_doc.id.clone(), side, d.s3_url, d.e_data_key, seqno)?;
            let existing_sides = id_doc
                .images(conn, true)?
                .into_iter()
                .map(|u| u.side)
                .collect_vec();
            let required_sides = id_doc
                .document_type
                .sides()
                .into_iter()
                .chain(doc_request.should_collect_selfie.then_some(DocumentSide::Selfie))
                .collect_vec();
            let missing_sides = required_sides
                .into_iter()
                .filter(|s| !existing_sides.contains(s))
                .collect_vec();

            // Now that the document is created, either initiate IDV reqs or create fixture data
            let result = if should_initiate_reqs {
                // Initiate IDV reqs once and only once for this id_doc
                let _ob = Onboarding::lock(conn, &ob_id)?; // Lock for DecisionIntent write
                let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &su_id, &wf_id)?;
                Some((decision_intent, doc_request, id_doc.id))
            } else {
                if missing_sides.is_empty() {
                    let fixture = id_doc.fixture_result;
                    // Create fixture data once all of the sides are uploaded
                    let ocr = serde_json::from_value(
                        idv::incode::doc::response::FetchOCRResponse::TEST_ONLY_FIXTURE(None, None, None),
                    )?;

                    // We need to synthetically set up a vres in order to not get db constraint errors when saving risk signals
                    let fake_score_response =
                        idv::incode::doc::response::FetchScoresResponse::TEST_ONLY_FIXTURE(fixture).unwrap();
                    let res = serde_json::to_value(fake_score_response.clone())?;
                    let vres = save_vres_for_fixture_risk_signals(conn, &su_id, &vault2, &wf_id, res)?;

                    // Enter the complete state
                    Complete::enter(
                        conn,
                        &vault2,
                        &su_id,
                        &id_doc.id,
                        id_doc.document_type,
                        ocr,
                        fake_score_response,
                        IncodeOcrComparisonDataFields::default(),
                        doc_request.should_collect_selfie,
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
    let response = if let Some((di, doc_request, id_doc_id)) = created_reqs {
        // Not sandbox - make our request to vendors!
        let t_id = user_auth.scoped_user.tenant_id.clone();
        handle_incode_request(&state, id_doc_id, t_id, di.id, vault, doc_request).await?
    } else {
        // Fixture response - we always complete successfully!
        let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
            .into_iter()
            .find(|s| missing_sides.contains(s));
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

#[allow(clippy::too_many_arguments)]
pub(in crate::user) async fn handle_incode_request(
    state: &State,
    identity_document_id: IdentityDocumentId,
    tenant_id: TenantId,
    decision_intent_id: DecisionIntentId,
    vault: Vault,
    doc_request: DocumentRequest,
) -> Result<DocumentResponse, ApiError> {
    let docv_data = build_docv_data_from_identity_doc(state, identity_document_id.clone()).await?; // TODO: handle this with better requirement checking

    // Initialize our state machine
    let ctx = IncodeContext {
        di_id: decision_intent_id,
        sv_id: doc_request.scoped_vault_id.clone(),
        id_doc_id: identity_document_id,
        vault,
        docv_data,
        doc_request_id: doc_request.id,
        enclave_client: state.enclave_client.clone(),
    };
    let machine = IncodeStateMachine::init(
        state,
        tenant_id,
        // TODO: upstream this somewhere based on OBC
        get_config_id(&state.config, doc_request.should_collect_selfie),
        ctx,
    )
    .await?; // TODO: handle this with better requirement checking

    let (machine, retry_reasons) = machine
        .run(&state.db_pool, &state.vendor_clients.incode)
        .await
        .map_err(|e| e.error)?;

    let next_side_to_collect = match machine.state.name() {
        IncodeVerificationSessionState::AddFront => Some(DocumentSide::Front),
        IncodeVerificationSessionState::AddBack => Some(DocumentSide::Back),
        IncodeVerificationSessionState::AddConsent => Some(DocumentSide::Selfie),
        IncodeVerificationSessionState::AddSelfie => Some(DocumentSide::Selfie),
        IncodeVerificationSessionState::Fail => None,
        IncodeVerificationSessionState::Complete => None,
        // We shouldn't cleanly break from the machine in any other state
        s => return Err(AssertionError(&format!("Can't determine next document side from {}", s)).into()),
    };
    let is_retry_limit_exceeded = machine.state.name() == IncodeVerificationSessionState::Fail;
    let errors = retry_reasons.into_iter().map(DocumentImageError::from).collect();
    let result = DocumentResponse {
        next_side_to_collect,
        errors,
        is_retry_limit_exceeded,
    };
    Ok(result)
}

pub(in crate::user) fn save_vres_for_fixture_risk_signals(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    vault: &Vault,
    wf_id: &WorkflowId,
    response: serde_json::Value,
) -> Result<VerificationResult, ApiError> {
    let di = DecisionIntent::get_or_create_onboarding_kyc(conn, sv_id, wf_id)?;
    let vreq = VerificationRequest::create(conn, sv_id, &di.id, VendorAPI::IncodeFetchScores)?;
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &response.clone().into(),
        &vault.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, response.into(), e_response, false)?;

    Ok(vres)
}
