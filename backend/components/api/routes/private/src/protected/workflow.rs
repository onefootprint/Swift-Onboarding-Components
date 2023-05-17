use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use db::models::workflow::Workflow;
use db::DbError;
use newtypes::{ScopedVaultId, WorkflowConfig, WorkflowId, WorkflowKind, WorkflowState};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateWorkflowRequest {
    pub sv_id: ScopedVaultId,
    pub wf_kind: WorkflowKind,
    pub wf_state: WorkflowState,
    pub wf_config: WorkflowConfig,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CreateWorkflowResponse {
    pub workflow_id: WorkflowId,
}

#[api_v2_operation(description = "Creates a single task scheduled for now", tags(Private))]
#[post("/private/protected/workflow/create_workflow")]
async fn create_workflow(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<CreateWorkflowRequest>,
) -> actix_web::Result<Json<ResponseData<CreateWorkflowResponse>>, ApiError> {
    let CreateWorkflowRequest {
        sv_id,
        wf_kind,
        wf_state,
        wf_config,
    } = request.into_inner();

    let wf = state
        .db_pool
        .db_query(move |conn| -> Result<Workflow, DbError> {
            Workflow::create(conn, sv_id, wf_kind, wf_state, wf_config)
        })
        .await??;

    Ok(Json(ResponseData::ok(CreateWorkflowResponse {
        workflow_id: wf.id,
    })))
}
