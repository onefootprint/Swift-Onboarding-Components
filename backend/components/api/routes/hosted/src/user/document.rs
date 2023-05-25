use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::large_json::LargeJson;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{decision, State};
use api_core::auth::user::UserObAuthContext;
use api_core::decision::vendor::build_request::build_docv_data_from_identity_doc;
use api_core::decision::vendor::state_machines::incode_state_machine::{IncodeContext, IncodeStateMachine};
use api_core::decision::vendor::state_machines::states::Complete;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::{Person, VwArgs};
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::{DocumentImageError, DocumentResponse};
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
use itertools::Itertools;
use newtypes::{
    DecisionIntentId, DocumentRequestId, DocumentSide, IdentityDocumentId, IncodeConfigurationId,
    SealedVaultDataKey, TenantId, VaultId,
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
    let (uvw, doc_request, user_consent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // If there's no pending doc requests, nothing to do here
            let doc_request = DbDocumentRequest::get_active(conn, &su_id)?
                .ok_or(OnboardingError::NoPendingDocumentRequestFound)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let user_consent = UserConsent::latest_for_onboarding(conn, &ob_id)?;
            Ok((uvw, doc_request, user_consent))
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
            uvw.vault.public_key.as_ref(),
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
        .map(|(side, e_data)| upload_image(&state, side, e_data, &doc_request.id, &uvw.vault.id, bucket))
        .collect_vec();

    let s3_urls = futures::future::try_join_all(s3_upload_futs).await?;

    // write a identity_document
    let doc_request_id = doc_request.id.clone();
    let ob_id = user_auth.onboarding()?.id.clone();
    let su_id = user_auth.scoped_user.id.clone();
    let vault = uvw.vault.clone();
    let created_reqs = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let doc_request = DbDocumentRequest::lock_active(conn, &su_id)?;
            let args = NewIdentityDocumentArgs {
                request_id: doc_request_id,
                document_type: request.document_type,
                country_code: request.country_code.clone(),
            };
            let id_doc = IdentityDocument::get_or_create(conn, args)?;
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
            let has_all_required_images = required_sides.into_iter().all(|s| existing_sides.contains(&s));
            let result = if has_all_required_images {
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
                    Complete::enter(conn, &vault, &su_id, &id_doc.id, doc_type, ocr)?;
                    None
                }
            } else {
                None
            };

            Ok(result)
        })
        .await?;

    if let Some((di, doc_request, id_doc_id)) = created_reqs {
        // Make our request!
        let t_id = user_auth.scoped_user.tenant_id.clone();
        handle_incode_request(&state, id_doc_id, t_id, di.id, uvw.vault, doc_request).await?;
    }

    let (doc_request, session) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let su_id = &user_auth.scoped_user.id;
            let doc_request = DbDocumentRequest::get(conn, su_id)?;
            let session = IncodeVerificationSession::get(conn, su_id)?;
            Ok((doc_request, session))
        })
        .await??;

    let status = doc_request.status.into();
    let errors = session
        .and_then(|s| s.latest_failure_reason)
        .into_iter()
        .map(DocumentImageError::from)
        .collect();

    ResponseData::ok(DocumentResponse { status, errors }).json()
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
pub async fn get(state: web::Data<State>, user_auth: UserObAuthContext) -> JsonApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let (doc_request, session) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let su_id = &user_auth.scoped_user.id;
            let doc_request = DbDocumentRequest::get(conn, su_id)?;
            let session = IncodeVerificationSession::get(conn, su_id)?;
            Ok((doc_request, session))
        })
        .await??;

    let status = doc_request.status.into();
    let errors = session
        .and_then(|s| s.latest_failure_reason)
        .into_iter()
        .map(DocumentImageError::from)
        .collect();

    ResponseData::ok(DocumentResponse { status, errors }).json()
}

#[allow(clippy::too_many_arguments)]
async fn handle_incode_request(
    state: &State,
    identity_document_id: IdentityDocumentId,
    tenant_id: TenantId,
    decision_intent_id: DecisionIntentId,
    vault: Vault,
    doc_request: DbDocumentRequest,
) -> Result<(), ApiError> {
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

    machine
        .run(&state.db_pool, &state.fp_client)
        .await
        .map_err(|e| e.error)?; // TODO: handle this error by cancelling session and putting doc request into failed

    Ok(())
}
