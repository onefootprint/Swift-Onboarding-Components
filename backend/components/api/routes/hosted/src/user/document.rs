use std::collections::HashMap;

use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::large_json::LargeJson;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::{decision, State};
use api_core::auth::user::{UserAuth, UserObAuthContext};
use api_core::config::Config;
use api_core::decision::vendor::build_request::build_docv_data_from_identity_doc;
use api_core::decision::vendor::state_machines::incode_state_machine::{IncodeState, IncodeStateMachine};
use api_core::enclave_client::EnclaveClient;
use api_core::errors::AssertionError;
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::{DocumentImageError, DocumentResponse, DocumentResponseStatus};
use crypto::aead::AeadSealedBytes;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::{DocumentRequest as DbDocumentRequest, DocumentRequestUpdate};
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::onboarding::Onboarding;
use db::models::user_consent::UserConsent;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::{DbError, DbPool, DbResult, PgConn, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use itertools::Itertools;
use newtypes::{
    DecisionIntentId, DocumentFace, DocumentKind, DocumentRequestId, DocumentRequestStatus,
    IdentityDocumentId, IncodeConfigurationId, IncodeVerificationFailureReason, ScopedVaultId,
    SealedVaultDataKey, TenantId, VaultId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const NUM_RETRIES: i64 = 3;
/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
/// TODO: rename to /hosted/user/identity_document or find a way to merge in with new generic doc upload endpoint
#[api_v2_operation(description = "POSTs an Identity document to footprint servers", tags(Hosted))]
#[actix::post("/hosted/user/document")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    request: LargeJson<DocumentRequest, 15_728_640>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let request = request.0;

    let (uv, doc_request, user_auth, user_consent) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no pending doc requests, nothing to do here
            let doc_request =
                DbDocumentRequest::lock_active(conn, &user_auth.scoped_user.id).map_err(|e| {
                    if e.is_not_found() {
                        ApiError::from(OnboardingError::NoPendingDocumentRequestFound)
                    } else {
                        ApiError::from(e)
                    }
                })?;
            // Move our request to Uploaded so any subsequent POSTs will fail
            let update = DocumentRequestUpdate::status(DocumentRequestStatus::Uploaded);
            let doc_request = doc_request.into_inner().update(conn.conn(), update)?;
            let uv = Vault::get(conn, user_auth.user_vault_id())?;

            let user_consent = UserConsent::latest_for_onboarding(conn, &user_auth.onboarding()?.id)?;

            Ok((uv, doc_request, user_auth, user_consent))
        })
        .await?;

    if request.selfie_image.is_some() {
        if !doc_request.should_collect_selfie {
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

    let bucket = &state.config.document_s3_bucket.clone();
    let su_id = user_auth.scoped_user.id.clone();

    //
    // Encrypt all images
    //
    let e_imgs = vec![
        Some((DocumentFace::Front, request.front_image)),
        request.back_image.map(|img| (DocumentFace::Back, img)),
        request.selfie_image.map(|img| (DocumentFace::Selfie, img)),
    ]
    .into_iter()
    .flatten()
    .map(|(face, img)| -> ApiResult<_> {
        let e_data = IdentityDocument::seal_with_data_key(img.leak(), &data_key)?;
        Ok((face, e_data))
    })
    .collect::<ApiResult<Vec<_>>>()?;

    //
    // Upload all images to s3
    //
    let s3_upload_futs = e_imgs
        .into_iter()
        .map(|(face, e_data)| upload_image(&state, face, e_data, &doc_request.id, &uv.id, bucket))
        .collect_vec();

    let mut s3_urls: HashMap<_, _> = match futures::future::try_join_all(s3_upload_futs).await {
        Ok(s) => Ok(s.into_iter().collect()),
        Err(e) => {
            handle_upload_error(&state.db_pool, doc_request.id.clone(), su_id).await?;
            Err(e)
        }
    }?;

    // write a identity_document
    let doc_request_id = doc_request.id.clone();
    let su_id = user_auth.scoped_user.id.clone();
    let identity_document = state
        .db_pool
        .db_transaction(move |conn| -> Result<IdentityDocument, ApiError> {
            // temporary: for compatibility with the new document kinds
            // Create a document record on the VW for each image type
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;

            // Add all Documents to the vault
            let mut lifetime_ids: HashMap<_, _> = s3_urls
                .iter()
                .map(|(face, url)| -> ApiResult<_> {
                    let kind = DocumentKind::from_id_doc_kind(request.document_type, *face);
                    let name = format!("{}.png", kind);
                    let mime_type = "image/png".to_string();
                    let result =
                        uvw.put_document(conn, kind, mime_type, name, e_data_key.clone(), url.clone())?;
                    Ok((face, result.lifetime_id))
                })
                .collect::<ApiResult<_>>()?;

            let args = NewIdentityDocumentArgs {
                request_id: doc_request_id,
                // TODO: should be from vendor response
                document_type: request.document_type,
                country_code: request.country_code.clone(),
                e_data_key: e_data_key.clone(),
                front_lifetime_id: lifetime_ids.remove(&DocumentFace::Front),
                back_lifetime_id: lifetime_ids.remove(&DocumentFace::Back),
                selfie_lifetime_id: lifetime_ids.remove(&DocumentFace::Selfie),
                front_image_s3_url: s3_urls.remove(&DocumentFace::Front),
                back_image_s3_url: s3_urls.remove(&DocumentFace::Back),
                selfie_image_s3_url: s3_urls.remove(&DocumentFace::Selfie),
            };
            let id_doc = IdentityDocument::create(conn, args)?;

            Ok(id_doc)
        })
        .await?;

    // Check if we should be initiating requests (e.g. check if we are testing)
    let su_id = user_auth.scoped_user.id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build(conn, VwArgs::Tenant(&su_id)))
        .await??;
    // TODO: generate fixture data for identity documents
    let ff_client = &state.feature_flag_client;
    let should_initiate_reqs =
        decision::utils::get_fixture_data_decision(&state, ff_client, &uvw, &user_auth.scoped_user.tenant_id)
            .await?
            .is_none();

    // Run vendor requests
    // TODO make this atomic with creating the ID
    if should_initiate_reqs {
        let su_id = user_auth.scoped_user.id.clone();
        let id_doc_id = identity_document.id.clone();
        let ob_id = user_auth.onboarding()?.id.clone();
        let (decision_intent, doc_request) = state
            .db_pool
            .db_transaction(
                move |conn| -> Result<(DecisionIntent, DbDocumentRequest), ApiError> {
                    // Protect against race conditions
                    let doc_request = DbDocumentRequest::lock(conn, &su_id, &doc_request.id)?;
                    let _ob = Onboarding::lock(conn, &ob_id)?; // Lock for DecisionIntent write
                    if doc_request.idv_reqs_initiated {
                        return Err(AssertionError("Document request already initiated").into());
                    }

                    let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &su_id)?;

                    // Move our status to uploaded since we have generated a doc verification request
                    let update = DocumentRequestUpdate::idv_reqs_initiated();
                    let doc_request = doc_request.into_inner().update(conn.conn(), update)?;

                    Ok((decision_intent, doc_request))
                },
            )
            .await?;

        // Make our request!
        handle_incode_request(
            &state.db_pool,
            &state.enclave_client,
            &state.config,
            &state.footprint_vendor_http_client,
            id_doc_id,
            user_auth.scoped_user.id.clone(),
            user_auth.scoped_user.tenant_id.clone(),
            decision_intent.id,
            uvw.vault,
            doc_request,
        )
        .await?;
    } else {
        // mark as complete if we are testing
        let su_id = user_auth.scoped_user.id.clone();
        state
            .db_pool
            .db_query(move |conn| -> Result<(), ApiError> {
                let update = DocumentRequestUpdate {
                    status: Some(DocumentRequestStatus::Complete),
                    ..Default::default()
                };
                doc_request.update(conn, update)?;

                let info = newtypes::IdentityDocumentUploadedInfo {
                    id: identity_document.id.clone(),
                };
                UserTimeline::create(conn, info, uvw.vault.id, su_id)?;

                Ok(())
            })
            .await??;
    }

    EmptyResponse::ok().json()
}

/// Uploads the provided image to s3.
/// Only needed because rust doesn't yet support async closures
async fn upload_image(
    state: &State,
    face: DocumentFace,
    e_data: AeadSealedBytes,
    req_id: &DocumentRequestId,
    uv_id: &VaultId,
    bucket: &str,
) -> ApiResult<(DocumentFace, String)> {
    let path = IdentityDocument::s3_path_for_document_image(face, req_id, uv_id);
    let s3_url = state.s3_client.put_object(bucket, path, e_data.0, None).await?;
    Ok((face, s3_url))
}

// This just can pull the latest for the scoped_user_id and lock
#[api_v2_operation(description = "GET a document request status", tags(Hosted))]
#[actix::get("/hosted/user/document/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
) -> actix_web::Result<Json<ResponseData<DocumentResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let (status, errors) = state
        .db_pool
        .db_query(move |conn| construct_get_response(conn, &user_auth.scoped_user.id))
        .await??;

    let response = DocumentResponse {
        status,
        errors,
        // TODO: Remove these fields
        front_image_error: None,
        back_image_error: None,
    };

    // in the case of a new doc request, this will have status=Error with errors populated from the prior one.
    // otherwise, we'll pass through the status
    ResponseData::ok(response).json()
}

pub fn construct_get_response(
    conn: &mut PgConn,
    scoped_user_id: &ScopedVaultId,
) -> Result<(DocumentResponseStatus, Vec<DocumentImageError>), ApiError> {
    // Get the latest document request for the scoped user, and the previous result (for errors).
    // We don't just stash the errors on the document request because with multiple vendors, we'll need
    // to handle each set of errors appropriately
    let (current_request, previous_request, _) =
        DbDocumentRequest::get_latest_with_previous_request_and_result(conn, scoped_user_id)?;

    let retry_limit_exceeded = retry_limit_exceeded(conn, &current_request.scoped_vault_id).unwrap_or(false);

    let should_return_errors = matches!(
        current_request.status,
        DocumentRequestStatus::Pending | DocumentRequestStatus::UploadFailed
    );
    let mut previous_request_errors: Vec<IncodeVerificationFailureReason> = vec![];
    let mut current_request_internal_errors_needing_retry: Vec<DocumentImageError> = vec![];
    let mut status = current_request.status.into();

    if should_return_errors {
        let incode_verification_session =
            IncodeVerificationSession::get(conn, scoped_user_id)?.ok_or(DbError::ObjectNotFound)?;

        if let Some(error) = incode_verification_session.latest_failure_reason {
            previous_request_errors.push(error)
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

    let errors: Vec<DocumentImageError> = previous_request_errors
        .into_iter()
        .map(DocumentImageError::from)
        .chain(current_request_internal_errors_needing_retry.into_iter())
        .collect();

    if !errors.is_empty() {
        status = DocumentResponseStatus::Error;
    }

    Ok((status, errors))
}

#[allow(clippy::too_many_arguments)]
async fn handle_incode_request(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    config: &Config,
    footprint_http_client: &FootprintVendorHttpClient,
    identity_document_id: IdentityDocumentId,
    scoped_vault_id: ScopedVaultId,
    tenant_id: TenantId,
    decision_intent_id: DecisionIntentId,
    user_vault: Vault,
    document_request: DbDocumentRequest,
) -> Result<(), ApiError> {
    let docv_data = build_docv_data_from_identity_doc(
        db_pool,
        enclave_client,
        identity_document_id.clone(),
        scoped_vault_id.clone(),
    )
    .await?; // TODO: handle this with better requirement checking

    // Initialize our state machine
    let machine = IncodeStateMachine::init(
        tenant_id,
        db_pool,
        enclave_client,
        config,
        decision_intent_id.clone(),
        scoped_vault_id.clone(),
        // TODO: upstream this somewhere based on OBC
        IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string()),
        identity_document_id.clone(),
    )
    .await?; // TODO: handle this with better requirement checking

    let result = machine
        .run(
            db_pool,
            footprint_http_client,
            user_vault.public_key.clone(),
            &docv_data,
        )
        .await
        .map_err(|e| e.error)?; // TODO: handle this error by cancelling session and putting doc request into failed

    // Incode has told us we need have a recoverable error, the error has been stashed on IncodeVerificationSession table
    let needs_retry = matches!(result.state, IncodeState::RetryUpload(_));

    db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            if needs_retry {
                handle_incode_error(
                    conn,
                    document_request,
                    user_vault.id,
                    scoped_vault_id,
                    identity_document_id,
                )?
            } else {
                handle_incode_success(
                    conn,
                    document_request,
                    user_vault.id,
                    scoped_vault_id,
                    identity_document_id,
                )?
            }

            Ok(())
        })
        .await?;

    Ok(())
}

fn handle_incode_error(
    conn: &mut TxnPgConn,
    document_request: DbDocumentRequest,
    user_vault_id: VaultId,
    scoped_vault_id: ScopedVaultId,
    identity_document_id: IdentityDocumentId,
) -> DbResult<()> {
    // Move our status to failed since we need a new doc verification request
    let failed_update = DocumentRequestUpdate {
        status: Some(DocumentRequestStatus::Failed),
        ..Default::default()
    };
    // Create a timeline event
    let info = newtypes::IdentityDocumentUploadedInfo {
        id: identity_document_id,
    };
    UserTimeline::create(conn, info, user_vault_id, scoped_vault_id.clone())?;

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
    if !retry_limit_exceeded(conn.conn(), &current_doc_request.scoped_vault_id)? {
        // Create a new document request.
        // ref_id is None here since we are retrying scan onboarding!
        DbDocumentRequest::create(
            conn,
            scoped_vault_id,
            None,
            should_collect_selfie,
            Some(current_doc_request_id),
        )?;
    }

    Ok(())
}

fn handle_incode_success(
    conn: &mut TxnPgConn,
    document_request: DbDocumentRequest,
    user_vault_id: VaultId,
    scoped_vault_id: ScopedVaultId,
    identity_document_id: IdentityDocumentId,
) -> DbResult<()> {
    let completed_update = DocumentRequestUpdate {
        status: Some(DocumentRequestStatus::Complete),
        ..Default::default()
    };

    document_request.update(conn.conn(), completed_update)?;

    // Create a timeline event
    let info = newtypes::IdentityDocumentUploadedInfo {
        id: identity_document_id,
    };
    UserTimeline::create(conn, info, user_vault_id, scoped_vault_id)?;

    Ok(())
}

async fn handle_upload_error(
    db_pool: &DbPool,
    document_request_id: DocumentRequestId,
    scoped_user_id: ScopedVaultId,
) -> DbResult<()> {
    // In the case of an s3 or other error, we move our status to UploadFailed
    db_pool
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
