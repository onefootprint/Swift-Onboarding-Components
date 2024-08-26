use crate::ProtectedAuth;
use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::actions::WorkflowActionsKind;
use api_core::decision::state::traits::Workflow as TWorkflow;
use api_core::decision::state::AsyncVendorCallsCompleted;
use api_core::decision::state::Authorize;
use api_core::decision::state::BoKycCompleted;
use api_core::decision::state::DocCollected;
use api_core::decision::state::MakeDecision;
use api_core::decision::state::MakeVendorCalls;
use api_core::decision::state::MakeWatchlistCheckCall;
use api_core::decision::state::WorkflowWrapper;
use api_core::types::ApiResponse;
use api_core::ApiCoreError;
use db::models::data_lifetime::DataLifetime;
use db::models::workflow::Workflow;
use db::DbResult;
use newtypes::WorkflowId;
use newtypes::WorkflowState;

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
) -> ApiResponse<ProceedResponse> {
    let ProceedRequest {
        wf_id,
        wf_action_kind,
    } = request.into_inner();

    let (wf, seqno) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let wf = Workflow::get(conn, &wf_id)?;
            let seqno = DataLifetime::get_current_seqno(conn)?;
            Ok((wf, seqno))
        })
        .await?;

    let ww = WorkflowWrapper::init(&state, wf.clone(), seqno).await?;

    let action = if let Some(wf_action_kind) = wf_action_kind {
        match wf_action_kind {
            WorkflowActionsKind::Authorize => WorkflowActions::Authorize(Authorize { seqno }),
            WorkflowActionsKind::MakeVendorCalls => {
                WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno })
            }
            WorkflowActionsKind::MakeDecision => WorkflowActions::MakeDecision(MakeDecision { seqno }),
            WorkflowActionsKind::MakeWatchlistCheckCall => {
                WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {})
            }
            WorkflowActionsKind::DocCollected => WorkflowActions::DocCollected(DocCollected {}),
            WorkflowActionsKind::BoKycCompleted => WorkflowActions::BoKycCompleted(BoKycCompleted {}),
            WorkflowActionsKind::AsyncVendorCallsCompleted => {
                WorkflowActions::AsyncVendorCallsCompleted(AsyncVendorCallsCompleted {})
            }
        }
    } else {
        ww.state
            .default_action(seqno)
            .ok_or(ApiCoreError::AssertionError(
                "Current state has no default action".to_string(),
            ))?
    };

    let ww = ww.run(&state, action).await?;

    Ok(ProceedResponse {
        new_workflow_state: newtypes::WorkflowState::from(&ww.state),
    })
}
