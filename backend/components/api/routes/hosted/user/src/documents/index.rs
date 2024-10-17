use crate::auth::user::UserAuthScope;
use crate::documents::get_user_or_business_for_dr;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::document::route_handler::handle_document_create;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_wire_types::CreateDocumentRequest;
use api_wire_types::CreateDocumentResponse;
use db::models::insight_event::CreateInsightEvent;
use macros::route_alias;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[route_alias(actix::post(
    "/hosted/user/documents",
    description = "Create a new document for the outstanding document request",
    tags(Document, Hosted)
))]
#[api_v2_operation(
    description = "Create a new document for the outstanding document request",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/documents")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: web::Json<CreateDocumentRequest>,
    insight: InsightHeaders,
) -> ApiResponse<CreateDocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let insight = CreateInsightEvent::from(insight);
    let request = request.into_inner();

    let tenant_id = user_auth.tenant.id.clone();

    let (sv_id, wf_id) = get_user_or_business_for_dr(&state, user_auth, request.request_id.clone()).await?;

    let response = handle_document_create(&state, request, tenant_id, sv_id, wf_id, insight).await?;
    Ok(CreateDocumentResponse { id: response })
}
