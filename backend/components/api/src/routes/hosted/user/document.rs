//////////////////////////////////////////
/// [Note]
/// As of 2022-11-08 we don't have vendor access and there's a bit of decision engine work to be done, so at the risk of diminishing marginal returns,
/// checkpointing the work here with some TODOs.
///
/// TODOs:
/// Notion: https://www.notion.so/onefootprint/Document-Request-TODOs-75f3131f609d4010a4e52799d9700525
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use actix_web::web::Path;
use api_wire_types::document_request::{
    DocumentErrorReason, DocumentRequest, DocumentResponse, DocumentResponseStatus,
};
use crypto::aead::AeadSealedBytes;
use db::models::document_request::{DocumentRequest as DbDocumentRequest, DocumentRequestUpdate};
use db::models::identity_document::IdentityDocument;
use newtypes::{Base64Data, DocumentRequestId, DocumentRequestStatus, OnboardingId};
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
    let uvw_id = user_auth.user_vault_id();
    let request_id = DocumentRequestId::from(path.into_inner());

    let (uvw, db_document_request, ob_id) = state
        .db_pool
        .db_transaction(
            move |conn| -> Result<(UserVaultWrapper, DbDocumentRequest, OnboardingId), ApiError> {
                let uvw = UserVaultWrapper::get(conn, &uvw_id)?;
                let Some(ob_id) = user_auth.onboarding(conn)?.map(|o| o.onboarding.id) else {
                    return Err(ApiError::from(OnboardingError::NoOnboarding))
                };

                // TODO::9
                // This will error if no doc request is found
                let db_document_request = DbDocumentRequest::get(conn, &ob_id, &request_id)?;

                Ok((uvw, db_document_request, ob_id))
            },
        )
        .await?;
    // Check request is pending. If not, there's nothing to do here
    if !db_document_request.is_pending() {
        return Err(ApiError::from(OnboardingError::NoPendingDocumentRequestFound(
            db_document_request.id,
        )));
    }

    let data_key = state
        .enclave_client
        .decrypt_sealed_vault_data_key(
            db_document_request.e_data_key.clone(),
            &uvw.user_vault.e_private_key,
            db::models::document_request::DocumentRequest::DATA_KEY_SCOPE,
        )
        .await?;

    // Encrypt the image using the UserVault
    // TODO::8
    let sealed_front = IdentityDocument::seal_with_data_key(&request.front_image, &data_key)?;

    // Save to s3
    let bucket = &state.config.document_s3_bucket.clone();
    let s3_path_front_image = state
        .s3_client
        .put_object(
            bucket,
            &IdentityDocument::s3_path_for_document_image(
                "front",
                db_document_request.id.clone(),
                uvw.user_vault.id.clone(),
            ),
            sealed_front.0,
        )
        .await?;

    // Not all documents have backs
    let mut s3_path_back_image: Option<String> = None;
    if let Some(back_image) = &request.back_image {
        let sealed_back = IdentityDocument::seal_with_data_key(back_image, &data_key)?;

        s3_path_back_image = Some(
            state
                .s3_client
                .put_object(
                    bucket,
                    &IdentityDocument::s3_path_for_document_image(
                        "back",
                        db_document_request.id.clone(),
                        uvw.user_vault.id.clone(),
                    ),
                    sealed_back.0,
                )
                .await?,
        );
    }

    // write a identity_document
    let doc_request_id = db_document_request.id.clone();
    state
        .db_pool
        .db_query(move |conn| -> Result<IdentityDocument, ApiError> {
            let doc = IdentityDocument::create(
                conn,
                doc_request_id,
                uvw.user_vault.id,
                Some(s3_path_front_image),
                s3_path_back_image,
                // TODO: should be from vendor response
                request.document_type.clone(),
                // TODO: should be from vendor response
                request.country_code.clone(),
                Some(ob_id),
            )?;

            Ok(doc)
        })
        .await?;

    let update = DocumentRequestUpdate {
        // For now, just move this to Uploaded here to clear the requirement
        status: Some(DocumentRequestStatus::Uploaded),
    };

    // TODO::1, TODO::2, TODO::3
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            db_document_request.update(conn, update)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "GET a document request status", tags(Hosted))]
#[actix::get("/hosted/user/document/{document_request_id}/{response_option}")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    path: Path<(String, String)>,
) -> actix_web::Result<Json<ResponseData<DocumentResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    // response_option is temporary, just so we can do frontend
    let (id, response_option) = path.into_inner();
    let document_request_id = DocumentRequestId::from(id);

    // TODO::5
    // Temporary while testing
    if response_option == "status" {
        let doc_req = state
            .db_pool
            .db_transaction(move |conn| -> Result<DbDocumentRequest, ApiError> {
                let Some(ob_id) = user_auth.onboarding(conn)?.map(|o| o.onboarding.id) else {
                    return Err(ApiError::from(OnboardingError::NoOnboarding))
                };
                // This will error if no doc request is found
                let db_document_request = DbDocumentRequest::get(conn, &ob_id, &document_request_id)?;

                Ok(db_document_request)
            })
            .await?;

        // TODO::4
        return ResponseData::ok(DocumentResponse {
            status: doc_req.status.into(),
            front_image_error: None,
            back_image_error: None,
        })
        .json();
    }
    // Similar to how we parse email/phone for sandbox
    ResponseData::ok(get_response_for_testing(response_option.as_str())).json()
}

// TODO::5
// Temporary - just for testing
fn get_response_for_testing(error_requested: &str) -> DocumentResponse {
    match error_requested {
        "front_error" => DocumentResponse {
            status: DocumentResponseStatus::Error,
            front_image_error: Some(DocumentErrorReason::Blurry),
            back_image_error: None,
        },
        "back_error" => DocumentResponse {
            status: DocumentResponseStatus::Error,
            front_image_error: None,
            back_image_error: Some(DocumentErrorReason::Blurry),
        },
        "both_error" => DocumentResponse {
            status: DocumentResponseStatus::Error,
            front_image_error: Some(DocumentErrorReason::Invalid),
            back_image_error: Some(DocumentErrorReason::Blurry),
        },
        "complete" => DocumentResponse {
            status: DocumentResponseStatus::Complete,
            front_image_error: None,
            back_image_error: None,
        },
        "pending" => DocumentResponse {
            status: DocumentResponseStatus::Pending,
            front_image_error: None,
            back_image_error: None,
        },
        "retry_limit" => DocumentResponse {
            status: DocumentResponseStatus::RetryLimitExceeded,
            front_image_error: None,
            back_image_error: None,
        },
        _ => DocumentResponse {
            status: DocumentResponseStatus::Complete,
            front_image_error: None,
            back_image_error: None,
        },
    }
}
