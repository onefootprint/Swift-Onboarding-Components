use crate::auth::user::UserAuthScope;
use crate::types::response::ResponseData;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::JsonApiResponse;
use api_core::{
    decision,
    State,
};
use api_wire_types::DocumentResponse;
use newtypes::{
    DocumentId,
    WorkflowGuard,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
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
) -> JsonApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let t_id = user_auth.scoped_user.tenant_id.clone();
    let wf = user_auth.workflow();
    let su_id = user_auth.scoped_user.id.clone();
    let wf_id = wf.id.clone();
    let response = decision::document::route_handler::handle_document_process(
        &state,
        su_id,
        wf_id,
        t_id,
        doc_id.into_inner(),
    )
    .await?;

    ResponseData::ok(response).json()
}
