use crate::{
    ProtectedAuth,
    State,
};
use actix_web::web::Json;
use actix_web::{
    post,
    web,
};
use api_core::decision::state::actions::{
    WorkflowActions,
    WorkflowActionsKind,
};
use api_core::decision::state::traits::Workflow as TWorkflow;
use api_core::decision::state::WorkflowWrapper;
use api_core::types::ModernApiResult;
use api_core::ApiErrorKind;
use db::models::workflow::Workflow;
use newtypes::{
    WorkflowId,
    WorkflowState,
};

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ProceedRequest {
    pub wf_id: WorkflowId,
    pub wf_action_kind: Option<WorkflowActionsKind>,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct ProceedResponse {
    pub new_workflow_state: WorkflowState,
}

#[post("/private/protected/workflow/proceed")]
async fn proceed(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<ProceedRequest>,
) -> ModernApiResult<ProceedResponse> {
    let ProceedRequest {
        wf_id,
        wf_action_kind,
    } = request.into_inner();

    let wf = state
        .db_pool
        .db_query(move |conn| Workflow::get(conn, &wf_id))
        .await?;

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;

    let action = if let Some(wf_action_kind) = wf_action_kind {
        WorkflowActions::try_from(wf_action_kind)?
    } else {
        ww.state.default_action().ok_or(ApiErrorKind::AssertionError(
            "Current state has no default action".to_string(),
        ))?
    };

    let ww = ww.run(&state, action).await?;

    Ok(ProceedResponse {
        new_workflow_state: newtypes::WorkflowState::from(&ww.state),
    })
}
