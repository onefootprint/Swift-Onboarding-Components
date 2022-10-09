use crate::auth::user::{UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::document::{
    DocumentErrorReason, DocumentResponse, DocumentResponseStatus,
};
use crate::types::response::{EmptyResponse, ResponseData};
use actix_web::web::Path;
use paperclip::actix::{api_v2_operation, get, post, web::Json};
/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
#[api_v2_operation(
    summary = "/hosted/user/document/",
    operation_id = "post-document",
    description = "POSTs a document to footprint servers",
    tags(Hosted)
)]
#[post("/document")]
pub async fn post(
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;
    ////////////////////
    // Temporary! getting shell for frontend
    ///////////////

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    summary = "/hosted/user/document/",
    operation_id = "get-document",
    description = "GET a document request status",
    tags(Hosted)
)]
#[get("/document/{test_error}")]
pub async fn get(
    user_auth: UserAuthContext,
    path: Path<String>,
) -> actix_web::Result<Json<ResponseData<DocumentResponse>>, ApiError> {
    ////////////////////
    // Temporary! getting shell for frontend
    ///////////////
    // Just check permissions for now, we don't need anything out of the UserSession
    user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;
    let test_error = path.into_inner();
    tracing::info!(test_error);

    // Similar to how we parse email/phone for sandbox
    let response = get_response_for_testing(test_error.as_str());
    ResponseData::ok(response).json()
}

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
        _ => DocumentResponse {
            status: DocumentResponseStatus::Complete,
            front_image_error: None,
            back_image_error: None,
        },
    }
}
