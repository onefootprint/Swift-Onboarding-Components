use crate::{auth::user::UserAuthGuard, decision, types::response::ResponseData, State};
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use api_core::{
    auth::user::UserWfAuthContext, decision::document::meta_headers::MetaHeaders, telemetry::RootSpan,
    types::JsonApiResponse, utils::file_upload::handle_file_upload,
};
use api_wire_types::DocumentResponse;

use newtypes::{DocumentSide, IdentityDocumentId, WorkflowGuard};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Upload an image for the given side to the provided ID doc.",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/upload/{side}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    args: web::Path<(IdentityDocumentId, DocumentSide)>,
    mut payload: Multipart,
    request: HttpRequest,
    meta: MetaHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<DocumentResponse> {
    let file = handle_file_upload(&mut payload, &request, None, 5_242_880).await?;

    let (document_id, side) = args.into_inner();
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let wf = user_auth.workflow().clone();
    let tenant_id = user_auth.tenant().id.clone();
    let wf_id = wf.id.clone();
    let su_id = user_auth.scoped_user.id.clone();

    let upload_res = decision::document::route_handler::handle_document_upload(
        &state,
        wf,
        su_id.clone(),
        meta,
        file,
        document_id.clone(),
        side,
    )
    .await?;

    let result = if let Some(res) = upload_res {
        root_span.record("meta", "processing separately");
        res
    } else {
        root_span.record("meta", "not_process_separately");
        tracing::info!("Performing process inside upload endpoint");
        decision::document::route_handler::handle_document_process(
            &state,
            su_id,
            wf_id,
            tenant_id,
            document_id,
        )
        .await?
    };

    ResponseData::ok(result).json()
}
