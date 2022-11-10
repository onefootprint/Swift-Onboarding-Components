//////////////////////////////////////////
/// [Note]
/// As of 2022-11-08 we don't have vendor access and there's a bit of decision engine work to be done, so at the risk of diminishing marginal returns,
/// checkpointing the work here with some TODOs.
///
/// TODOs:
/// 1. Update DocumentRequest.status to UPLOADED
///    - This will only happen AFTER we create a VerificationRequest. See comment on DocumentRequestStatus
/// 2. Save an IdentityDocument
///     - Should document_type be based on vendor response? argoff thinks probably
///     - Should country_code be based on vendor response? argoff thinks probably
///     - Should we save both the self reported fields as well? might be good for features
/// 3. Make actual request to vendors
///     - create a VerificationRequest.
///     - Involves decision engine work (without making a OnboardingDecision?) or should it make a DocumentDecision?
/// 4. Parse VerificationResult and return a DocumentResponse
///     -  DocumentRequest -> IdentityDocument -> VerificationRequest -> VerificationResult parsing
///     - Involves decision engine work (without making a OnboardingDecision?) or should it make a DocumentDecision?
/// 5. Remove the temporary testing things
/// 6. Figure out the size limits for API reqs in main.rs - currently we limit to 5MB, but that's arbitary and we'll need to do some frontend work to limit or resize
/// 7. Should add some actual images to the test_fixtures in the integration tests
/// 8. Should wrap request b64 data in something like PiiString so that any errors don't leak the b64 string
/// 9. Portability
///    - In terms of initial collection (DocumentRequests)
///       - Right now, DocumentRequests are tied to specific onboardings. In a portable world, this needs to be at a UV level so any Tenant can satisfy it
///    - "inherited"/not recollecting - the documents right now aren’t really portable across tenants. if you already have a drivers license that you uploaded while onboarding onto tenant A,
///         we don’t have any logic that goes and finds that while you’re onboarding onto tenant B
/// 10. create a UserTimeline event to show when a document has been uploaded
/// 11. Just a noodle: but I wonder if we want to perhaps handle image upload a different way. Here's one way:
///     - BE generates a symmetric key K and sends to FE (along with short-lived S3 credentials)
///     - encrypts image with K
///     - uploads encrypted image directly to S3
///     - BE pulls, decrypts,
///     This is an optimization I think we can do later, but imagine this will be significantly more performant as we won't need to handle large bytes going from frontend -> CF, ALB, container, etc.
///     AWS S3 clients exist for JS/web that handle a bunch of edge cases around large file uploads.
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
use db::models::document_request::{DocumentRequest as DbDocumentRequest, DocumentRequestUpdate};
use db::models::identity_document::IdentityDocument;
use newtypes::{DocumentRequestId, DocumentRequestStatus};
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

    let (uvw, db_document_request) = state
        .db_pool
        .db_transaction(
            move |conn| -> Result<(UserVaultWrapper, DbDocumentRequest), ApiError> {
                let uvw = UserVaultWrapper::get(conn, &uvw_id)?;
                let Some(ob_id) = user_auth.onboarding(conn)?.map(|o| o.onboarding.id) else {
                    return Err(ApiError::from(OnboardingError::NoOnboarding))
                };

                // TODO::9
                // This will error if no doc request is found
                let db_document_request = DbDocumentRequest::get(conn, ob_id, request_id)?;

                Ok((uvw, db_document_request))
            },
        )
        .await?;
    // Check request is pending. If not, there's nothing to do here
    if !db_document_request.is_pending() {
        return Err(ApiError::from(OnboardingError::NoPendingDocumentRequestFound(
            db_document_request.id,
        )));
    }

    // Encrypt the image using the UserVault
    // TODO::8
    let sealed_front = IdentityDocument::vault_seal_from_base64_string(
        &request.front_image,
        request.document_type.clone(),
        &uvw.user_vault.public_key,
    )?;

    // Save to s3
    let bucket = &state.config.document_s3_bucket.clone();
    let _s3_path_front_image = state
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
    let Some(back_image) = &request.back_image else {
        return EmptyResponse::ok().json()
    };

    let sealed_back = IdentityDocument::vault_seal_from_base64_string(
        back_image,
        request.document_type.clone(),
        &uvw.user_vault.public_key,
    )?;
    let _s3_path_back_image = state
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
        .await?;
    // TODO::1, TODO::2, TODO::3
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            // For now, just move this to Uploaded here to clear the requirement
            db_document_request.update(
                conn,
                DocumentRequestUpdate::status(DocumentRequestStatus::Uploaded),
            )?;

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
                let db_document_request = DbDocumentRequest::get(conn, ob_id, document_request_id.clone())?;

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
