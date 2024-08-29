use self::kyb::KybState;
use crate::FpResult;
use crate::State;
use api_errors::FpErrorCode;
use db::models::data_lifetime::DataLifetime;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::workflow::Workflow as DbWorkflow;
use db::DbResult;
use enum_dispatch::enum_dispatch;
use newtypes::DataLifetimeSeqno;
use newtypes::WorkflowId;
use thiserror::Error;
use tokio::time::Instant;

pub mod actions;
pub use actions::*;
pub mod common;
pub mod document;
pub mod kyb;
pub mod kyc;
#[cfg(test)]
pub mod test_utils;
pub mod traits;

use traits::DoAction;
use traits::OnAction;
use traits::Workflow;
use traits::WorkflowState;

#[derive(Debug, Error)]
pub enum StateError {
    #[error("Unexpected action for state")]
    UnexpectedActionForState, // TODO: paramaterize
    #[error("Unexpected state: {0} for workflow: {1}")]
    UnexpectedStateForWorkflow(newtypes::WorkflowState, WorkflowId),
    #[error("Unexpected config: {0:?} for workflow: {1}")]
    UnexpectedConfigForWorkflow(newtypes::WorkflowConfig, WorkflowId),
    #[error("Attempted to transition state, but state has been modified. Expected: {0}, found state: {1}")]
    ConcurrentStateChange(newtypes::WorkflowState, newtypes::WorkflowState),
    #[error("IncodeMachine: Attempted to transition state, but state has been modified. Expected: {0}, found state: {1}")]
    IncodeMachineConcurrentStateChange(
        newtypes::IncodeVerificationSessionState,
        newtypes::IncodeVerificationSessionState,
    ),
    #[error("Error initializing state {0}: {1}")]
    StateInitError(String, String),
    #[error("Cannot materialize {0} into WorkflowActions")]
    WorkflowActionsConversionError(WorkflowActionsKind),
}

impl api_errors::FpErrorTrait for StateError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<FpErrorCode> {
        match self {
            StateError::IncodeMachineConcurrentStateChange(_, _) => {
                Some(FpErrorCode::IncodeMachineConcurrentChange)
            }
            _ => None,
        }
    }
}

use super::vendor::incode::IncodeStateMachine;
use document::DocumentState;
use kyc::KycState;

#[enum_dispatch(Workflow)]
#[derive(Clone)]
pub enum WorkflowKind {
    Kyc(KycState),
    Document(DocumentState),
    Kyb(KybState),
}

impl std::fmt::Debug for WorkflowKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        newtypes::WorkflowState::from(self).fmt(f)
    }
}

impl From<&WorkflowKind> for newtypes::WorkflowState {
    fn from(value: &WorkflowKind) -> Self {
        match value {
            WorkflowKind::Kyc(s) => s.name(),
            WorkflowKind::Document(s) => s.name(),
            WorkflowKind::Kyb(s) => s.name(),
        }
    }
}

/// Wraps any WorkflowWrapperState to provide util methods to initialize a workflow from its
/// serialized form in the DB and run the workflow.
#[derive(Debug)]
pub struct WorkflowWrapper {
    pub state: WorkflowKind,
    pub workflow_id: WorkflowId,
    pub seqno: DataLifetimeSeqno,
}

impl WorkflowWrapper {
    #[tracing::instrument("WorkflowWrapper::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, seqno: DataLifetimeSeqno) -> FpResult<Self> {
        let workflow_id = workflow.id.clone();
        let s = match workflow.state {
            newtypes::WorkflowState::Kyc(_) => KycState::init(state, workflow, seqno).await?.into(),
            newtypes::WorkflowState::AlpacaKyc(_) => todo!(), //throw an error
            newtypes::WorkflowState::Document(_) => DocumentState::init(state, workflow, seqno).await?.into(),
            newtypes::WorkflowState::Kyb(_) => KybState::init(state, workflow, seqno).await?.into(),
        };
        Ok(Self {
            state: s,
            workflow_id,
            seqno,
        })
    }

    #[tracing::instrument("WorkflowWrapper::action", skip(state))]
    pub async fn action(
        self,
        state: &State,
        action: WorkflowActions,
    ) -> FpResult<(Self, Option<WorkflowActions>)> {
        let Self {
            state: wf_state,
            workflow_id,
            seqno,
        } = self;
        tracing::info!(workflow_id=?workflow_id, wf_state=?wf_state, action=?action, "[WorkflowWrapper::action] Running action on workflow");
        let next_state = wf_state.action(state, action, workflow_id.clone()).await?;
        let next_action = next_state.default_action(seqno);
        tracing::info!(workflow_id=?workflow_id, next_state=?next_state, next_action=?next_action, "[WorkflowWrapper::action] Action ran on workflow");
        let next = Self {
            state: next_state,
            workflow_id,
            seqno,
        };
        Ok((next, next_action))
    }

    #[tracing::instrument("WorkflowWrapper::run", skip(state))]
    pub async fn run(self, state: &State, action: WorkflowActions) -> FpResult<Self> {
        let mut next_action = Some(action);
        let mut ww = self;
        while let Some(action) = next_action {
            (ww, next_action) = ww.action(state, action).await?;
        }
        Ok(ww)
    }
}

pub enum RunIncodeMachineAndWorkflowResult {
    IncodeStuck,
    WorkflowTimedOut,
    WorkflowRan,
}

#[tracing::instrument(skip_all)]
pub async fn run_incode_machine_and_workflow(
    state: &State,
    ww: WorkflowWrapper,
    deadline: Instant,
) -> FpResult<RunIncodeMachineAndWorkflowResult> {
    let wfid = ww.workflow_id.clone();
    let (ivs, seqno) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            // TODO this doesn't have to be a latest - there's only one active per workflow
            let ivs = IncodeVerificationSession::latest_for_workflow(conn, &wfid)?;

            let seqno = DataLifetime::get_current_seqno(conn)?;

            Ok((ivs, seqno))
        })
        .await?;

    if let Some(ivs) = ivs {
        if !ivs.state.is_terminal() {
            let machine_fut = IncodeStateMachine::init_from_existing(state, ivs);
            let machine = match tokio::time::timeout_at(deadline, machine_fut).await {
                Ok(result) => result?,
                Err(_) => {
                    tracing::error!("Timeout initializing Incode machine via future cancellation");
                    return Ok(RunIncodeMachineAndWorkflowResult::IncodeStuck);
                }
            };


            // TODO: should or could this call handle_incode_request instead..?  yeah def cause then it can do
            // the new logic of setting latest_hard_error
            let run_fut = machine.run(&state.db_pool, &state.vendor_clients.incode);
            let fut_with_timeout = tokio::time::timeout_at(deadline, run_fut);

            match fut_with_timeout.await {
                Ok(Ok((machine, _))) => {
                    if !machine.state.name().is_terminal() {
                        // we still timed out polling Incode and shouldn't proceed with running the workflow
                        tracing::error!("Re-running Incode machine did not succeed, not running Workflow");
                        return Ok(RunIncodeMachineAndWorkflowResult::IncodeStuck);
                    }
                }
                Ok(Err(e)) => {
                    return Err(e.error);
                }
                Err(_) => {
                    tracing::error!("Timeout running Incode machine via future cancellation");
                    return Ok(RunIncodeMachineAndWorkflowResult::IncodeStuck);
                }
            }
        }
    }

    let next_action = ww.state.default_action(seqno);
    if let Some(next_action) = next_action {
        let ww_run_fut = ww.run(state, next_action);
        let fut_with_timeout = tokio::time::timeout_at(deadline, ww_run_fut);
        match fut_with_timeout.await {
            Ok(result) => {
                result?;
            }
            Err(_) => {
                tracing::error!("Timeout running workflow via future cancellation");
                return Ok(RunIncodeMachineAndWorkflowResult::WorkflowTimedOut);
            }
        }
    }

    Ok(RunIncodeMachineAndWorkflowResult::WorkflowRan)
}
