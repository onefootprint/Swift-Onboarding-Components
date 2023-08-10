use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use actix_web::{post, web, web::Json};
use api_core::auth::tenant::{CheckTenantGuard, FirmEmployeeAuthContext, TenantGuard};
use api_core::auth::Either;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::traits::Workflow as TWorkflow;
use api_core::decision::state::{WorkflowActionsKind, WorkflowWrapper};
use api_core::ApiErrorKind;
use chrono::Utc;
use db::models::workflow::{NewWorkflow, Workflow};
use db::DbError;
use newtypes::{OnboardingStatus, ScopedVaultId, WorkflowConfig, WorkflowId, WorkflowKind, WorkflowState};

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CreateWorkflowRequest {
    pub sv_id: ScopedVaultId,
    pub wf_kind: WorkflowKind,
    pub wf_state: WorkflowState,
    pub wf_config: WorkflowConfig,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct CreateWorkflowResponse {
    pub workflow_id: WorkflowId,
}

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
            Workflow::insert(
                conn,
                NewWorkflow {
                    created_at: Utc::now(),
                    scoped_vault_id: sv_id,
                    kind: wf_kind,
                    state: wf_state,
                    config: wf_config,
                    fixture_result: None,
                    status: Some(OnboardingStatus::Incomplete),
                    ob_configuration_id: None,
                    insight_event_id: None,
                },
            )
        })
        .await??;

    Ok(Json(ResponseData::ok(CreateWorkflowResponse {
        workflow_id: wf.id,
    })))
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ProceedRequest {
    pub wf_id: WorkflowId,
    pub wf_action_kind: Option<WorkflowActionsKind>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProceedResponse {
    pub new_workflow_state: WorkflowState,
}

#[post("/private/protected/workflow/proceed")]
async fn proceed(
    state: web::Data<State>,
    auth: Either<ProtectedCustodianAuthContext, FirmEmployeeAuthContext>,
    request: Json<ProceedRequest>,
) -> actix_web::Result<Json<ResponseData<ProceedResponse>>, ApiError> {
    if let Either::Right(auth) = auth {
        // Basically, make sure only "Risk ops" employees can hit this API
        auth.check_guard(TenantGuard::ManualReview)?;
    }

    let ProceedRequest {
        wf_id,
        wf_action_kind,
    } = request.into_inner();

    let wf = state
        .db_pool
        .db_query(move |conn| Workflow::get(conn, &wf_id))
        .await??;

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;

    let action = if let Some(wf_action_kind) = wf_action_kind {
        WorkflowActions::try_from(wf_action_kind)?
    } else {
        ww.state.default_action().ok_or(ApiErrorKind::AssertionError(
            "Current state has no default action".to_string(),
        ))?
    };

    let ww = ww.run(&state, action).await?;

    Ok(Json(ResponseData::ok(ProceedResponse {
        new_workflow_state: newtypes::WorkflowState::from(&ww.state),
    })))
}
