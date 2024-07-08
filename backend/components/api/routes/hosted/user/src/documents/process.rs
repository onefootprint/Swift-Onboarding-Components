use crate::auth::user::UserAuthScope;
use crate::documents::get_user_or_business_for_dr;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::document::route_handler::handle_document_process;
use api_core::decision::document::route_handler::IncodeConfigurationIdOverride;
use api_core::decision::document::route_handler::IsRerun;
use api_core::types::ApiResponse;
use api_core::State;
use api_wire_types::DocumentResponse;
use newtypes::DocumentId;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Continue processing the ID doc, if any remaining",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/process")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    doc_id: web::Path<DocumentId>,
) -> ApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let t_id = user_auth.scoped_user.tenant_id.clone();
    let doc_id = doc_id.into_inner();

    let (sv_id, wf_id) = get_user_or_business_for_dr(&state, user_auth, Some(doc_id.clone())).await?;

    let response = handle_document_process(
        &state,
        sv_id,
        wf_id,
        t_id,
        doc_id,
        IsRerun(false),
        IncodeConfigurationIdOverride(None),
    )
    .await?;

    Ok(response)
}
