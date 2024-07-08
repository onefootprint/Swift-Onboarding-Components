use crate::auth::user::UserAuthScope;
use crate::documents::get_user_or_business_for_dr;
use crate::State;
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::document::meta_headers::MetaHeaders;
use api_core::decision::document::route_handler::handle_document_upload;
use api_core::types::ApiResponse;
use api_core::utils::file_upload::handle_file_upload;
use macros::route_alias;
use newtypes::DocumentId;
use newtypes::DocumentSide;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

const MIN_DOCUMENT_SIZE_IN_BYTES: usize = 100;
const MAX_DOCUMENT_SIZE_IN_BYTES: usize = 5_242_880;

#[route_alias(actix::post(
    "/hosted/user/documents/{id}/upload/{side}",
    description = "Upload an image for the given side to the provided document.",
    tags(Document, Hosted)
))]
#[api_v2_operation(
    description = "Upload an image for the given side to the provided document.",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/documents/{id}/upload/{side}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    args: web::Path<(DocumentId, DocumentSide)>,
    mut payload: Multipart,
    request: HttpRequest,
    meta: MetaHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let file = handle_file_upload(
        &mut payload,
        &request,
        None,
        MAX_DOCUMENT_SIZE_IN_BYTES,
        MIN_DOCUMENT_SIZE_IN_BYTES,
    )
    .await?;

    let (document_id, side) = args.into_inner();
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;

    let (sv_id, wf_id) = get_user_or_business_for_dr(&state, user_auth, Some(document_id.clone())).await?;

    handle_document_upload(&state, wf_id, sv_id, meta, file, document_id, side).await?;

    Ok(api_wire_types::Empty)
}
