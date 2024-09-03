use crate::auth::user::UserAuthScope;
use crate::documents::get_user_or_business_for_dr;
use actix_web::HttpRequest;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::document::route_handler::handle_document_process;
use api_core::decision::document::route_handler::IncodeConfigurationIdOverride;
use api_core::decision::document::route_handler::IsRerun;
use api_core::types::ApiResponse;
use api_core::utils::timeouts::ResponseDeadline;
use api_core::State;
use api_wire_types::DocumentResponse;
use macros::route_alias;
use newtypes::DocumentId;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};
use std::time::Duration;

#[route_alias(actix::post(
    "/hosted/user/documents/{id}/process",
    description = "Process the document and run any vendor verifications.",
    tags(Document, Hosted)
))]
#[api_v2_operation(
    description = "Process the document and run any vendor verifications.",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/documents/{id}/process")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    doc_id: web::Path<DocumentId>,
    http_request: HttpRequest,
) -> ApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let t_id = user_auth.scoped_user.tenant_id.clone();
    let doc_id = doc_id.into_inner();

    let (sv_id, wf_id) = get_user_or_business_for_dr(&state, user_auth, Some(doc_id.clone())).await?;


    let deadline = ResponseDeadline::from_req_or_timeout(&http_request, Duration::from_secs(50))
        .into_instant()
        - Duration::from_secs(10); // Small buffer to gracefully handle the incode timeout before
                                   // the timeout middleware cancels the whole request.
    let response = handle_document_process(
        &state,
        sv_id,
        wf_id,
        t_id,
        doc_id,
        IsRerun(false),
        IncodeConfigurationIdOverride(None),
        deadline,
    )
    .await?;

    Ok(response)
}
