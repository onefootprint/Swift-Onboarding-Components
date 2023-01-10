use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::onboarding::OnboardingError;
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{decision, State};
use actix_web::web::Path;
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::{DocumentImageError, DocumentResponse};
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::document_request::{DocumentRequest as DbDocumentRequest, DocumentRequestUpdate};
use db::models::identity_document::IdentityDocument;
use db::models::user_vault::UserVault;
use db::models::verification_request::VerificationRequest;
use idv::ParsedResponse;
use newtypes::idology::IdologyImageCaptureErrors;
use newtypes::{DocumentRequestId, DocumentRequestStatus, ScopedUserId, SealedVaultDataKey};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
#[api_v2_operation(description = "POSTs a document to footprint servers", tags(Hosted))]
#[actix::post("/hosted/user/document/{document_request_id}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: web::Json<DocumentRequest>,
    path: Path<String>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let uv_id = user_auth.user_vault_id();
    let request_id = DocumentRequestId::from(path.into_inner());

    let (uv, db_document_request, auth_info) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let Some(auth_info) = user_auth.onboarding(conn)? else {
                return Err(ApiError::from(OnboardingError::NoOnboarding))
            };

            // This will error if no doc request is found
            let db_document_request = DbDocumentRequest::lock(conn, &auth_info.scoped_user.id, &request_id)?;
            // Check request is pending. If not, there's nothing to do here
            if !db_document_request.is_pending() {
                return Err(ApiError::from(OnboardingError::NoPendingDocumentRequestFound(
                    db_document_request.id.clone(),
                )));
            }
            let uv = UserVault::get(conn, &uv_id)?;

            Ok((uv, db_document_request.into_inner(), auth_info))
        })
        .await?;

    if !db_document_request.should_collect_selfie && request.selfie_image.is_some() {
        return Err(TenantError::ValidationError(
            "Document request is not expecting selfie_image".to_owned(),
        )
        .into());
    }

    // generate a sealed data key (with its plaintext)
    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            uv.public_key.as_ref(),
        )?;

    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;

    // Encrypt the image using the UserVault
    let sealed_front = IdentityDocument::seal_with_data_key(request.front_image.leak(), &data_key)?;

    // Save to s3
    let bucket = &state.config.document_s3_bucket.clone();
    let s3_path_front_image = state
        .s3_client
        .put_object(
            bucket,
            &IdentityDocument::s3_path_for_document_image(
                "front",
                db_document_request.id.clone(),
                uv.id.clone(),
            ),
            sealed_front.0,
        )
        .await?;

    // Not all documents have backs
    let mut s3_path_back_image: Option<String> = None;
    if let Some(back_image) = &request.back_image {
        let sealed_back = IdentityDocument::seal_with_data_key(back_image.leak(), &data_key)?;

        s3_path_back_image = Some(
            state
                .s3_client
                .put_object(
                    bucket,
                    &IdentityDocument::s3_path_for_document_image(
                        "back",
                        db_document_request.id.clone(),
                        uv.id.clone(),
                    ),
                    sealed_back.0,
                )
                .await?,
        );
    }

    let mut s3_path_selfie_image: Option<String> = None;
    if let Some(selfie_image) = &request.selfie_image {
        let encrypted_selfie_image = IdentityDocument::seal_with_data_key(selfie_image.leak(), &data_key)?;

        s3_path_selfie_image = Some(
            state
                .s3_client
                .put_object(
                    bucket,
                    &IdentityDocument::s3_path_for_document_image(
                        "selfie",
                        db_document_request.id.clone(),
                        uv.id.clone(),
                    ),
                    encrypted_selfie_image.0,
                )
                .await?,
        );
    }

    // write a identity_document
    let doc_request_id = db_document_request.id.clone();
    let su_id = auth_info.scoped_user.id.clone();
    let suid = auth_info.scoped_user.id.clone();
    let identity_document = state
        .db_pool
        .db_transaction(move |conn| -> Result<IdentityDocument, ApiError> {
            IdentityDocument::create(
                conn,
                doc_request_id,
                &uv.id,
                Some(s3_path_front_image),
                s3_path_back_image,
                s3_path_selfie_image,
                // TODO: should be from vendor response
                request.document_type.clone(),
                request.country_code.clone(),
                Some(&su_id),
                e_data_key,
            )
            .map_err(ApiError::from)
        })
        .await?;

    // Check if we should be initiating requests (e.g. check if we are testing)
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build_for_onboarding(conn, &suid))
        .await??;
    let should_initiate_verification_requests =
        decision::utils::should_initiate_idv_or_else_setup_test_fixtures(
            &state,
            uvw,
            auth_info.onboarding.id.clone(),
            // TODO: generate fixture data for identity documents
            false,
        )
        .await?;
    // TODO: more vendors!
    let api = newtypes::VendorAPI::IdologyScanOnboarding;
    if db_document_request.ref_id.is_some() {
        return Err(ApiError::AssertionError(
            "ref_id found for document request".into(),
        ));
    }

    // Save Verification Requests and run our vendor requests
    if should_initiate_verification_requests {
        // Save our verification request
        let ob_id = auth_info.onboarding.id.clone();
        let (document_verification_request, doc_request) = state
            .db_pool
            .db_transaction(
                move |conn| -> Result<(VerificationRequest, DbDocumentRequest), ApiError> {
                    // Protect against race conditions
                    let doc_request = DbDocumentRequest::lock(
                        conn,
                        &db_document_request.scoped_user_id,
                        &db_document_request.id,
                    )?;
                    if doc_request.idv_reqs_initiated {
                        return Err(ApiError::AssertionError(
                            "Document request already initiated".into(),
                        ));
                    }

                    let res = decision::utils::create_document_verification_request(
                        conn.conn(),
                        api,
                        ob_id,
                        identity_document.id,
                    )?;

                    // Move our status to uploaded since we have generated a doc verification request
                    let update = DocumentRequestUpdate::idv_reqs_initiated();
                    let doc_request = doc_request.into_inner().update(conn.conn(), update)?;

                    Ok((res, doc_request))
                },
            )
            .await?;

        // Make our request!
        handle_scan_onboarding_request(
            &state,
            doc_request,
            document_verification_request,
            auth_info.scoped_user.id.clone(),
        )
        .await?;
    } else {
        // mark as complete if we are testing
        state
            .db_pool
            .db_query(move |conn| -> Result<(), ApiError> {
                let update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Complete),
                    ..Default::default()
                };
                db_document_request.update(conn, update)?;

                Ok(())
            })
            .await??;
    }

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "GET a document request status", tags(Hosted))]
#[actix::get("/hosted/user/document/{document_request_id}/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    path: Path<String>,
) -> actix_web::Result<Json<ResponseData<DocumentResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let id = path.into_inner();
    let request_id = DocumentRequestId::from(id);

    // Load our document request and check the status
    let (document_request, errors) = state
        .db_pool
        .db_query(move |conn| -> Result<(DbDocumentRequest, Vec<_>), ApiError> {
            let Some(auth_info) = user_auth.onboarding(conn)? else {
                return Err(ApiError::from(OnboardingError::NoOnboarding))
            };
            // Get document request, and potentially the result (if it's done)
            let (request, verification_result) = DbDocumentRequest::get_with_verification_result(
                conn,
                &auth_info.scoped_user.id,
                &request_id,
            )?;

            // Return errors related to images
            let errors: Vec<IdologyImageCaptureErrors> = if let Some(result) = verification_result {
                let parsed = idv::idology::scan_onboarding::response::parse_response(result.response)
                    .map_err(|_| {
                        ApiError::AssertionError("Could not parse ScanOnboarding response".into())
                    })?;
                if let Some((None, image_errors)) = parsed.response.error() {
                    image_errors
                } else {
                    vec![]
                }
            } else {
                vec![]
            };

            Ok((request, errors))
        })
        .await??;

    ResponseData::ok(DocumentResponse {
        status: document_request.status.into(),
        errors: errors.into_iter().map(DocumentImageError::from).collect(),
        // TODO: Remove these fields
        front_image_error: None,
        back_image_error: None,
    })
    .json()
}

async fn handle_scan_onboarding_request(
    state: &State,
    document_request: DbDocumentRequest,
    document_verification_request: VerificationRequest,
    scoped_user_id: ScopedUserId,
) -> Result<(), ApiError> {
    // Make document verification request
    // TODO: spawn a thread to make this request, but scan onboarding returns immediately (allegedly) so it's fine for now
    let vendor_result =
        decision::vendor::make_request::make_docv_request(state, document_verification_request).await?;

    // Handle request
    let response = match vendor_result.response.response {
        ParsedResponse::IDologyScanOnboarding(response) => Ok(response),
        _ => Err(ApiError::AssertionError(
            "wrong document vendor response received".into(),
        )),
    }?;

    let should_collect_selfie = document_request.should_collect_selfie;
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            if response.response.needs_retry() {
                // Move our status to failed since we need a new doc verification request
                let failed_update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Failed),
                    ..Default::default()
                };
                document_request.update(conn.conn(), failed_update)?;

                // Create a new document request.
                // ref_id is None here since we are retrying scan onboarding!
                DbDocumentRequest::create(conn, scoped_user_id, None, should_collect_selfie)?;
            } else {
                let completed_update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Complete),
                    ..Default::default()
                };
                document_request.update(conn.conn(), completed_update)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}
