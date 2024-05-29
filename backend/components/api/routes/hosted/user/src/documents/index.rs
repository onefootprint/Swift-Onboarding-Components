use crate::auth::user::UserAuthScope;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision;
use api_core::types::JsonApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_wire_types::{
    CreateDocumentRequest,
    CreateDocumentResponse,
};
use db::models::insight_event::CreateInsightEvent;
use newtypes::WorkflowGuard;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Create a new identity document for this user's outstanding document request",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: web::Json<CreateDocumentRequest>,
    insight: InsightHeaders,
) -> JsonApiResponse<CreateDocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let insight = CreateInsightEvent::from(insight);

    let su_id = user_auth.scoped_user.id.clone();
    let tenant_id = user_auth.tenant().id.clone();
    let wf_id = user_auth.workflow().id.clone();
    let response = decision::document::route_handler::handle_document_create(
        &state,
        request.into_inner(),
        tenant_id,
        su_id,
        wf_id,
        insight,
    )
    .await?;
    ResponseData::ok(CreateDocumentResponse { id: response }).json()
}
