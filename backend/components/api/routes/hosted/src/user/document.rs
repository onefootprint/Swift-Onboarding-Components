use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::large_json::LargeJson;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{decision, State};
use api_core::auth::user::{UserObAuthContext, UserObSession};
use api_core::auth::SessionContext;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::{DocCollected, WorkflowWrapper};
use api_core::decision::vendor::build_request::build_docv_data_from_identity_doc;
use api_core::decision::vendor::incode::states::Complete;
use api_core::decision::vendor::incode::{IncodeContext, IncodeStateMachine};
use api_core::errors::AssertionError;
use api_core::types::JsonApiResponse;
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::{DocumentImageError, DocumentResponse, LegacyDocumentResponse};
use crypto::aead::AeadSealedBytes;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::DocumentRequest as DbDocumentRequest;
use db::models::document_upload::DocumentUpload;
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::onboarding::Onboarding;
use db::models::user_consent::UserConsent;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::DbError;
use itertools::Itertools;
use newtypes::DataIdentifierDiscriminant;
use newtypes::{
    DecisionIntentId, DocumentKind, DocumentRequestId, DocumentSide, IdentityDocumentId,
    IncodeConfigurationId, IncodeVerificationSessionState, SealedVaultDataKey, TenantId, VaultId,
};
use paperclip::actix::{self, api_v2_operation, web};

/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
/// TODO: rename to /hosted/user/identity_document or find a way to merge in with new generic doc upload endpoint
#[api_v2_operation(description = "POSTs an Identity document to footprint servers", tags(Hosted))]
#[actix::post("/hosted/user/document")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    request: LargeJson<DocumentRequest, 15_728_640>,
) -> JsonApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let request = request.0;

    let su_id = user_auth.scoped_user.id.clone();
    let ob_id = user_auth.onboarding()?.id.clone();
    let (vault, doc_request, user_consent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // If there's no pending doc requests, nothing to do here
            let doc_request = DbDocumentRequest::get_active(conn, &su_id)?
                .ok_or(OnboardingError::NoPendingDocumentRequestFound)?;
            let vault = Vault::get(conn, &su_id)?;
            let user_consent = UserConsent::latest_for_onboarding(conn, &ob_id)?;
            Ok((vault, doc_request, user_consent))
        })
        .await??;

    if request.selfie_image.is_some() {
        if !doc_request.should_collect_selfie {
            return Err(OnboardingError::NotExpectingSelfie.into());
        }
        if user_consent.is_none() {
            return Err(OnboardingError::UserConsentNotFound.into());
        }
    }

    // generate a sealed data key (with its plaintext)
    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            vault.public_key.as_ref(),
        )?;
    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
    let bucket = &state.config.document_s3_bucket.clone();

    // Check if we should be initiating requests (e.g. check if we are testing)
    let should_initiate_reqs = decision::utils::get_fixture_data_decision(
        &state,
        state.feature_flag_client.clone(),
        &user_auth.scoped_user.id,
        &user_auth.scoped_user.tenant_id,
    )
    .await?
    .is_none();

    //
    // Encrypt all images
    //
    let e_imgs = vec![
        request.front_image.map(|img| (DocumentSide::Front, img)),
        request.back_image.map(|img| (DocumentSide::Back, img)),
        request.selfie_image.map(|img| (DocumentSide::Selfie, img)),
    ]
    .into_iter()
    .flatten()
    .map(|(side, img)| -> ApiResult<_> {
        let e_data = IdentityDocument::seal_with_data_key(img.leak(), &data_key)?;
        Ok((side, e_data))
    })
    .collect::<ApiResult<Vec<_>>>()?;

    //
    // Upload all images to s3
    //
    let s3_upload_futs = e_imgs
        .into_iter()
        .map(|(side, e_data)| upload_image(&state, side, e_data, &doc_request.id, &vault.id, bucket))
        .collect_vec();

    let s3_urls = futures::future::try_join_all(s3_upload_futs).await?;

    // write a identity_document
    let doc_request_id = doc_request.id.clone();
    let ob_id = user_auth.onboarding()?.id.clone();
    let su_id = user_auth.scoped_user.id.clone();
    let vault2 = vault.clone();
    let (missing_sides, created_reqs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;
            // Get or create the identity document
            let doc_request = DbDocumentRequest::lock_active(conn, &su_id)?;
            let args = NewIdentityDocumentArgs {
                request_id: doc_request_id,
                document_type: request.document_type,
                country_code: request.country_code.clone(),
            };
            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            // Vault the images under latest uploads
            for (side, s3_url) in s3_urls.iter() {
                let kind = DocumentKind::LatestUpload(id_doc.document_type, *side);
                let name = format!("{}.png", kind);
                let mime_type = "image/png".to_string();
                uvw.put_document_unsafe(conn, kind, mime_type, name, e_data_key.clone(), s3_url.clone())?;
            }
            // Create each of the uploads
            s3_urls
                .into_iter()
                .map(|(side, s3_url)| {
                    DocumentUpload::create(conn, id_doc.id.clone(), side, s3_url, e_data_key.clone())
                })
                .collect::<db::DbResult<Vec<_>>>()?;

            // Check if all documents are uploaded before proceeding
            // In the future, we'll proceed until the state machine reaches the end
            let existing_sides = id_doc.images(conn)?.into_iter().map(|u| u.side).collect_vec();
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
            let result = if missing_sides.is_empty() {
                // Mark the document request as Uploaded
                //
                // Now that the document is created, either initiate IDV reqs or create fixture data
                //
                if should_initiate_reqs {
                    // Initiate IDV reqs once and only once for this id_doc
                    let _ob = Onboarding::lock(conn, &ob_id)?; // Lock for DecisionIntent write
                    let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &su_id)?;
                    Some((decision_intent, doc_request.into_inner(), id_doc.id))
                } else {
                    // Create fixture data
                    let ocr = idv::incode::doc::response::FetchOCRResponse::TEST_ONLY_FIXTURE();
                    let doc_type = request.document_type;
                    Complete::enter(conn, &vault2, &su_id, &id_doc.id, doc_type, ocr)?;
                    None
                }
            } else {
                None
            };

            Ok((missing_sides, result))
        })
        .await?;

    let response = if let Some((di, doc_request, id_doc_id)) = created_reqs {
        // Not sandbox - make our request to vendors!
        let t_id = user_auth.scoped_user.tenant_id.clone();
        handle_incode_request(&state, id_doc_id, t_id, di.id, vault, doc_request, &user_auth).await?
    } else {
        // Fixture response - we always complete successfully!
        advance_workflow_if_needed(&state, &user_auth).await?;
        let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
            .into_iter()
            .find(|s| missing_sides.contains(s));
        DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        }
    };
    ResponseData::ok(response).json()
}

/// Uploads the provided image to s3.
/// Only needed because rust doesn't yet support async closures
async fn upload_image(
    state: &State,
    side: DocumentSide,
    e_data: AeadSealedBytes,
    req_id: &DocumentRequestId,
    uv_id: &VaultId,
    bucket: &str,
) -> ApiResult<(DocumentSide, String)> {
    let path = IdentityDocument::s3_path_for_document_image(side, req_id, uv_id);
    let s3_url = state.s3_client.put_object(bucket, path, e_data.0, None).await?;
    Ok((side, s3_url))
}

// TODO deprecate this
#[api_v2_operation(description = "GET a document request status", tags(Hosted))]
#[actix::get("/hosted/user/document/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<LegacyDocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let (doc_request, session) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let su_id = &user_auth.scoped_user.id;
            let doc_request = DbDocumentRequest::get(conn, su_id)?.ok_or(DbError::ObjectNotFound)?;
            // TODO this will break with workflows. Should deprecate this API before then
            let id_doc = IdentityDocument::list(conn, su_id)?
                .into_iter()
                .next()
                .ok_or(ApiError::ResourceNotFound)?;
            let session = IncodeVerificationSession::get(conn, &id_doc.id)?;
            Ok((doc_request, session))
        })
        .await??;

    let status = doc_request.status.into();
    let errors = session
        .map(|s| s.latest_failure_reasons)
        .unwrap_or_default()
        .into_iter()
        .map(DocumentImageError::from)
        .collect();

    ResponseData::ok(LegacyDocumentResponse { status, errors }).json()
}

#[allow(clippy::too_many_arguments)]
async fn handle_incode_request(
    state: &State,
    identity_document_id: IdentityDocumentId,
    tenant_id: TenantId,
    decision_intent_id: DecisionIntentId,
    vault: Vault,
    doc_request: DbDocumentRequest,
    user_auth: &SessionContext<UserObSession>,
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
    };
    let machine = IncodeStateMachine::init(
        state,
        tenant_id,
        // TODO: upstream this somewhere based on OBC
        IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string()),
        ctx,
    )
    .await?; // TODO: handle this with better requirement checking

    let (machine, retry_reasons) = machine
        .run(&state.db_pool, &state.fp_client)
        .await
        .map_err(|e| e.error)?;

    let next_side_to_collect = match machine.state.name() {
        IncodeVerificationSessionState::AddFront => Some(DocumentSide::Front),
        IncodeVerificationSessionState::AddBack => Some(DocumentSide::Back),
        IncodeVerificationSessionState::AddSelfie => Some(DocumentSide::Selfie),
        IncodeVerificationSessionState::Fail => None,
        IncodeVerificationSessionState::Complete => {
            advance_workflow_if_needed(state, user_auth).await?;
            None
        }
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

#[tracing::instrument(skip_all)]
async fn advance_workflow_if_needed(
    state: &State,
    user_auth: &SessionContext<UserObSession>,
) -> ApiResult<()> {
    let wf: Result<&Workflow, ApiError> = user_auth.workflow();
    if let Ok(wf) = wf {
        let ww = WorkflowWrapper::init(state, wf.clone()).await?;
        let curr_state = newtypes::WorkflowState::from(&ww.state);
        // This is kind of hacky but in some cases when we are collecting a doc, that is because we step'd up and are reflecting that with a DocCollection state in a workflow
        // In other cases, the OBC might be configured to just always collect doc. If that's the case, then we expect the workflow to just be in the generic DataCollection state
        // and we don't need to run the workflow (Bifrost will run the workflow by pinging /authorize when all required data is collected)
        let obc = user_auth.ob_config()?;
        if !obc.must_collect(DataIdentifierDiscriminant::Document) {
            let _ww = ww
                .run(state, WorkflowActions::DocCollected(DocCollected {}))
                .await?;
        } else {
            tracing::info!(curr_state=?curr_state,"OBC must collect document, skipping running workflow");
        }
    } else {
        // for now gracefully allow this since we are still FF'ing creation of workflows
        tracing::warn!("Workflow not found");
    };
    Ok(())
}
