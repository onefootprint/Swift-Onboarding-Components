use crate::auth::user::UserAuthScope;
use crate::types::response::ResponseData;
use crate::{
    decision,
    State,
};
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::document::meta_headers::MetaHeaders;
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
};
use api_core::utils::file_upload::handle_file_upload;
use newtypes::{
    DocumentId,
    DocumentSide,
    WorkflowGuard,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

const MIN_DOCUMENT_SIZE_IN_BYTES: usize = 100;
const MAX_DOCUMENT_SIZE_IN_BYTES: usize = 5_242_880;

#[api_v2_operation(
    description = "Upload an image for the given side to the provided ID doc.",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/upload/{side}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    args: web::Path<(DocumentId, DocumentSide)>,
    mut payload: Multipart,
    request: HttpRequest,
    meta: MetaHeaders,
) -> JsonApiResponse<EmptyResponse> {
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
    let wf = user_auth.workflow().clone();
    let su_id = user_auth.scoped_user.id.clone();

    decision::document::route_handler::handle_document_upload(
        &state,
        wf,
        su_id.clone(),
        meta,
        file,
        document_id.clone(),
        side,
    )
    .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
