use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScopeDiscriminant, UserSession};
use crate::auth::SessionContext;
use crate::errors::onboarding::OnboardingError;
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::large_json::LargeJson;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::{decision, State};
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::{DocumentImageError, DocumentResponse, DocumentResponseStatus};
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::document_request::{DocumentRequest as DbDocumentRequest, DocumentRequestUpdate};
use db::models::identity_document::IdentityDocument;
use db::models::user_consent::UserConsent;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::{DbError, DbPool, DbResult, PgConn};
use futures::TryFutureExt;
use idv::ParsedResponse;
use newtypes::idology::IdologyImageCaptureErrors;
use newtypes::{
    DocumentRequestId, DocumentRequestStatus, IdentityDocumentId, OnboardingId, ScopedVaultId,
    SealedVaultDataKey, VaultId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const FRONT: &str = "front";
const BACK: &str = "back";
const SELFIE: &str = "selfie";
const NUM_RETRIES: i64 = 3;
/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
#[api_v2_operation(description = "POSTs a document to footprint servers", tags(Hosted))]
#[actix::post("/hosted/user/document")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: LargeJson<DocumentRequest, 15_728_640>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let (uv, db_document_request, auth_info, user_consent) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let Some(auth_info) = user_auth.onboarding(conn)? else {
                return Err(ApiError::from(OnboardingError::NoOnboarding))
            };

            // If there's no pending doc requests, nothing to do here
            let db_document_request = DbDocumentRequest::lock_active(conn, &auth_info.scoped_user.id)
                .map_err(|e| {
                    if e.is_not_found() {
                        ApiError::from(OnboardingError::NoPendingDocumentRequestFound)
                    } else {
                        ApiError::from(e)
                    }
                })?;
            // Move our request to Uploaded so any subsequent POSTs will fail
            let update = DocumentRequestUpdate::status(DocumentRequestStatus::Uploaded);
            let db_document_request = db_document_request.into_inner().update(conn.conn(), update)?;
            let uv = Vault::get(conn, user_auth.user_vault_id())?;

            let user_consent = UserConsent::latest_for_onboarding(conn, &auth_info.onboarding.id)?;

            Ok((uv, db_document_request, auth_info, user_consent))
        })
        .await?;

    if request.selfie_image.is_some() {
        if !db_document_request.should_collect_selfie {
            return Err(TenantError::ValidationError(
                "Document request is not expecting selfie_image".to_owned(),
            )
            .into());
        }

        if user_consent.is_none() {
            return Err(ApiError::from(OnboardingError::UserConsentNotFound));
        }
    }

    // generate a sealed data key (with its plaintext)
    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            uv.public_key.as_ref(),
        )?;

    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;

    // Encrypt the image using the UserVault
    let sealed_front = IdentityDocument::seal_with_data_key(request.front_image.leak(), &data_key)?;
    // ////////////////////
    // Save to s3
    // //////////////////
    let bucket = &state.config.document_s3_bucket.clone();
    let mut s3_upload_futures = vec![];
    // Front
    let s3_path_front_result = state
        .s3_client
        .put_object(
            bucket,
            IdentityDocument::s3_path_for_document_image(
                FRONT,
                db_document_request.id.clone(),
                uv.id.clone(),
            ),
            sealed_front.0,
            None,
        )
        .into_future();

    s3_upload_futures.push((FRONT, s3_path_front_result));

    if let Some(back_image) = &request.back_image {
        let sealed_back = IdentityDocument::seal_with_data_key(back_image.leak(), &data_key)?;

        let s3_path_back_result = state
            .s3_client
            .put_object(
                bucket,
                IdentityDocument::s3_path_for_document_image(
                    BACK,
                    db_document_request.id.clone(),
                    uv.id.clone(),
                ),
                sealed_back.0,
                None,
            )
            .into_future();

        s3_upload_futures.push((BACK, s3_path_back_result));
    }

    if let Some(selfie_image) = &request.selfie_image {
        let encrypted_selfie_image = IdentityDocument::seal_with_data_key(selfie_image.leak(), &data_key)?;

        let s3_path_selfie_result = state
            .s3_client
            .put_object(
                bucket,
                IdentityDocument::s3_path_for_document_image(
                    SELFIE,
                    db_document_request.id.clone(),
                    uv.id.clone(),
                ),
                encrypted_selfie_image.0,
                None,
            )
            .into_future();

        s3_upload_futures.push((SELFIE, s3_path_selfie_result));
    }

    let (doc_types, futures): (Vec<_>, Vec<_>) = s3_upload_futures.into_iter().unzip();
    // This returned future will 1) return an error if any underlying futures error and 2)
    // will preserve ordering of the original vec of futures
    let results: Vec<String> = match futures::future::try_join_all(futures).await {
        Ok(s) => Ok(s),
        Err(e) => {
            handle_s3_upload_error(
                &state,
                db_document_request.id.clone(),
                auth_info.scoped_user.id.clone(),
            )
            .await?;

            Err(e)
        }
    }?;

    let mut s3_path_front_image = None;
    let mut s3_path_back_image = None;
    let mut s3_path_selfie_image = None;
    for (idx, dt) in doc_types.into_iter().enumerate() {
        match dt {
            FRONT => s3_path_front_image = Some(results[idx].to_owned()),
            BACK => s3_path_back_image = Some(results[idx].to_owned()),
            SELFIE => s3_path_selfie_image = Some(results[idx].to_owned()),
            _ => {}
        }
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
                s3_path_front_image,
                s3_path_back_image,
                s3_path_selfie_image,
                // TODO: should be from vendor response
                request.document_type,
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
        .db_query(move |conn| VaultWrapper::build(conn, VwArgs::Tenant(&suid)))
        .await??;
    // TODO: generate fixture data for identity documents
    let ff_client = &state.feature_flag_client;
    let should_initiate_reqs =
        decision::utils::get_fixture_data_decision(&state, ff_client, &uvw, &auth_info.scoped_user.tenant_id)
            .await?
            .is_none();
    // TODO: more vendors!
    let api = newtypes::VendorAPI::IdologyScanOnboarding;
    if db_document_request.ref_id.is_some() {
        return Err(ApiError::AssertionError(
            "ref_id found for document request".into(),
        ));
    }

    // Save Verification Requests and run our vendor requests
    if should_initiate_reqs {
        // Save our verification request
        let su_id = auth_info.scoped_user.id.clone();
        let id_doc_id = identity_document.id.clone();
        let (document_verification_request, doc_request) = state
            .db_pool
            .db_transaction(
                move |conn| -> Result<(VerificationRequest, DbDocumentRequest), ApiError> {
                    // Protect against race conditions
                    let doc_request = DbDocumentRequest::lock(conn, &su_id, &db_document_request.id)?;
                    if doc_request.idv_reqs_initiated {
                        return Err(ApiError::AssertionError(
                            "Document request already initiated".into(),
                        ));
                    }

                    let res = decision::utils::create_document_verification_request(
                        conn.conn(),
                        api,
                        su_id,
                        id_doc_id,
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
            &auth_info.onboarding.id,
            doc_request,
            document_verification_request,
            auth_info.scoped_user.id.clone(),
            auth_info.scoped_user.user_vault_id.clone(),
            identity_document.id.clone(),
        )
        .await?;
    } else {
        // mark as complete if we are testing
        let su_id = auth_info.scoped_user.id.clone();
        state
            .db_pool
            .db_query(move |conn| -> Result<(), ApiError> {
                let update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Complete),
                    ..Default::default()
                };
                db_document_request.update(conn, update)?;

                UserTimeline::create(
                    conn,
                    newtypes::DocumentUploadedInfo {
                        id: identity_document.id.clone(),
                    },
                    uvw.vault.id,
                    Some(su_id),
                )?;

                Ok(())
            })
            .await??;
    }

    EmptyResponse::ok().json()
}

// This just can pull the latest for the scoped_user_id and lock
#[api_v2_operation(description = "GET a document request status", tags(Hosted))]
#[actix::get("/hosted/user/document/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<DocumentResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let response = get_inner(&state.db_pool, user_auth).await?;

    // in the case of a new doc request, this will have status=Error with errors populated from the prior one.
    // otherwise, we'll pass through the status
    ResponseData::ok(response).json()
}

pub async fn get_inner(
    db_pool: &DbPool,
    user_auth: SessionContext<UserSession>,
) -> Result<DocumentResponse, ApiError> {
    let scoped_user_id = db_pool
        .db_query(move |conn| -> Result<ScopedVaultId, ApiError> {
            let Some(auth_info) = user_auth.onboarding(conn)? else {
        return Err(ApiError::from(OnboardingError::NoOnboarding))
    };
            Ok(auth_info.scoped_user.id)
        })
        .await??;

    let (status, errors) = db_pool
        .db_query(move |conn| construct_get_response(conn, scoped_user_id))
        .await??;

    Ok(DocumentResponse {
        status,
        errors,
        // TODO: Remove these fields
        front_image_error: None,
        back_image_error: None,
    })
}

/// Based on the current and previous requests, map to our API response
pub fn construct_get_response(
    conn: &mut PgConn,
    scoped_user_id: ScopedVaultId,
) -> Result<(DocumentResponseStatus, Vec<DocumentImageError>), ApiError> {
    // Get the latest document request for the scoped user, and the previous result (for errors).
    // We don't just stash the errors on the document request because with multiple vendors, we'll need
    // to handle each set of errors appropriately
    let (current_request, previous_request, previous_request_verification_result) =
        DbDocumentRequest::get_latest_with_previous_request_and_result(conn, &scoped_user_id)?;
    let retry_limit_exceeded = retry_limit_exceeded(conn, &current_request.scoped_user_id).unwrap_or(false);

    let should_return_errors = matches!(
        current_request.status,
        DocumentRequestStatus::Pending | DocumentRequestStatus::UploadFailed
    );
    let mut previous_request_errors: Vec<IdologyImageCaptureErrors> = vec![];
    let mut current_request_internal_errors_needing_retry: Vec<DocumentImageError> = vec![];
    let mut status = current_request.status.into();

    if should_return_errors {
        if let Some(result) = previous_request_verification_result {
            // TODO: need to decrypt this
            let parsed = idv::idology::scan_onboarding::response::parse_response(result.response.0)
                .map_err(|_| ApiError::AssertionError("Could not parse ScanOnboarding response".into()))?;
            if let Some((None, image_errors)) = parsed.response.error() {
                previous_request_errors = image_errors;
                // If we actually have errors, we should tell the frontend that there's an error, even
                // though we have a pending doc request
                status = DocumentResponseStatus::Error;
            }

            // we don't get image errors for idology internal errors, but still want to return an error.
            if parsed.response.capture_result_is_internal_error() {
                status = DocumentResponseStatus::Error;
                previous_request_errors = vec![IdologyImageCaptureErrors::ImageError]
            }
        }

        // If s3 or postgres errors when writing an identity document, we should ask client to retry (we handle retry limit exceeded below)
        if previous_request
            .map(|d| d.status == DocumentRequestStatus::UploadFailed)
            .unwrap_or(false)
        {
            current_request_internal_errors_needing_retry.push(DocumentImageError::InternalError)
        }
    };
    // handle retries
    if retry_limit_exceeded {
        status = DocumentResponseStatus::RetryLimitExceeded
    }

    let errors = previous_request_errors
        .into_iter()
        .map(DocumentImageError::from)
        .chain(current_request_internal_errors_needing_retry.into_iter())
        .collect();

    Ok((status, errors))
}

#[tracing::instrument(skip(state, document_request, document_verification_request))]
async fn handle_scan_onboarding_request(
    state: &State,
    onboarding_id: &OnboardingId,
    document_request: DbDocumentRequest,
    document_verification_request: VerificationRequest,
    scoped_user_id: ScopedVaultId,
    user_vault_id: VaultId,
    identity_document_id: IdentityDocumentId,
) -> Result<(), ApiError> {
    // Make document verification request
    // TODO: spawn a thread to make this request, but scan onboarding returns immediately (allegedly) so it's fine for now
    let verification_request_id = document_verification_request.id.clone();
    let vendor_result = decision::vendor::make_request::make_docv_request(
        state,
        document_verification_request,
        onboarding_id,
    )
    .await;

    // Our vendor request could fail for some reason. We handle most errors in the vendor request code, but if
    // some anticipated error arises, if we don't catch the error here, we introduce a potential loophole for someone to get through
    // doc verification by somehow inducing a failure on the vendor side
    let mut status = DocumentRequestStatus::Complete;
    let needs_retry = match vendor_result {
        Err(e) => {
            tracing::warn!(verification_request=%verification_request_id, err=%e, "Document vendor request failed for unknown reason");
            status = DocumentRequestStatus::UploadFailed;
            true
        }
        Ok(result) => {
            // Handle request
            let response = match result.response.response {
                ParsedResponse::IDologyScanOnboarding(response) => Ok(response),
                _ => Err(ApiError::AssertionError(
                    "wrong document vendor response received".into(),
                )),
            }?;

            if response.response.needs_retry() {
                status = DocumentRequestStatus::Failed;
                true
            } else {
                false
            }
        }
    };

    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            if needs_retry {
                // Move our status to failed since we need a new doc verification request
                let failed_update = DocumentRequestUpdate {
                    status: Some(status),
                    ..Default::default()
                };
                // Create a timeline event
                UserTimeline::create(
                    conn,
                    newtypes::DocumentUploadedInfo {
                        id: identity_document_id.clone(),
                    },
                    user_vault_id,
                    Some(scoped_user_id.clone()),
                )?;

                let current_doc_request = document_request.update(conn.conn(), failed_update)?;
                let current_doc_request_id = current_doc_request.id.clone();
                let should_collect_selfie = current_doc_request.should_collect_selfie;
                // If we have exceeded our retry limit, we no longer want to create new document requests and
                // we're done. GETting the status at this point will return `RetryLimitExceed` to the frontend
                //
                // Note (2023-01-19):
                //   There's a the question of how to represent this in the document request status, if at all.
                //   Since "failing due to retries" is a part of the overall bifrost "Doc collection" step, and not an individual doc request itself.
                //   I think in order to maintain a serialized log of why an entire set of document requests failed, we'd need a new data model and this just seemed simpler for now to encode in runtime logic
                if !retry_limit_exceeded(conn.conn(), &current_doc_request.scoped_user_id)? {
                    // Create a new document request.
                    // ref_id is None here since we are retrying scan onboarding!
                    DbDocumentRequest::create(
                        conn,
                        scoped_user_id,
                        None,
                        should_collect_selfie,
                        Some(current_doc_request_id),
                    )?;
                }
            } else {
                let completed_update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Complete),
                    ..Default::default()
                };

                document_request.update(conn.conn(), completed_update)?;

                // Create a timeline event
                UserTimeline::create(
                    conn,
                    newtypes::DocumentUploadedInfo {
                        id: identity_document_id,
                    },
                    user_vault_id,
                    Some(scoped_user_id),
                )?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}

async fn handle_s3_upload_error(
    state: &State,
    document_request_id: DocumentRequestId,
    scoped_user_id: ScopedVaultId,
) -> DbResult<()> {
    // In the case of an s3 error, we move our status to UploadFailed
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), DbError> {
            let doc = DbDocumentRequest::lock(conn, &scoped_user_id, &document_request_id)?;

            let update = DocumentRequestUpdate::status(DocumentRequestStatus::UploadFailed);
            let current_doc = doc.into_inner().update(conn, update)?;

            // Create a new document request.
            // ref_id is None here since we are retrying scan onboarding!
            DbDocumentRequest::create(
                conn,
                scoped_user_id,
                None,
                current_doc.should_collect_selfie,
                Some(current_doc.id),
            )?;

            Ok(())
        })
        .await
}

// We only allow users to have NUM_RETRIES tries. We'll handle Failed vs. UpploadFailed differently when creating a decision
fn retry_limit_exceeded(conn: &mut PgConn, scoped_user_id: &ScopedVaultId) -> Result<bool, DbError> {
    let num_failed = DbDocumentRequest::count_statuses(
        conn,
        scoped_user_id,
        vec![DocumentRequestStatus::Failed, DocumentRequestStatus::UploadFailed],
    )?;

    Ok(num_failed >= NUM_RETRIES)
}
