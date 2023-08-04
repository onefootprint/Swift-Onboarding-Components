use db::models::workflow::Workflow as DbWorkflow;
use enum_dispatch::enum_dispatch;
use newtypes::WorkflowId;
use thiserror::Error;

use crate::{errors::ApiResult, State};

use self::{actions::WorkflowActions, kyb::KybState};

pub mod actions;
pub use actions::*;
pub mod alpaca_kyc;
pub mod common;
pub mod document;
pub mod kyb;
pub mod kyc;
#[cfg(test)]
pub mod test_utils;
pub mod traits;

use traits::{DoAction, OnAction, Workflow, WorkflowState};

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
    #[error("Error initializing state {0}: {1}")]
    StateInitError(String, String),
    #[error("Cannot materialize {0} into WorkflowActions")]
    WorkflowActionsConversionError(WorkflowActionsKind),
}

use alpaca_kyc::AlpacaKycState;
use document::DocumentState;
use kyc::KycState;

#[enum_dispatch(Workflow)]
#[derive(Clone)]
pub enum WorkflowKind {
    Kyc(KycState),
    AlpacaKyc(AlpacaKycState),
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
            WorkflowKind::AlpacaKyc(s) => s.name(),
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
}

impl WorkflowWrapper {
    #[tracing::instrument("WorkflowWrapper::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow) -> ApiResult<Self> {
        let workflow_id = workflow.id.clone();
        let s = match workflow.state {
            newtypes::WorkflowState::Kyc(_) => KycState::init(state, workflow).await?.into(),
            newtypes::WorkflowState::AlpacaKyc(_) => AlpacaKycState::init(state, workflow).await?.into(),
            newtypes::WorkflowState::Document(_) => DocumentState::init(state, workflow).await?.into(),
            newtypes::WorkflowState::Kyb(_) => KybState::init(state, workflow).await?.into(),
        };
        Ok(Self {
            state: s,
            workflow_id,
        })
    }

    #[tracing::instrument("WorkflowWrapper::action", skip(state))]
    pub async fn action(
        self,
        state: &State,
        action: WorkflowActions,
    ) -> ApiResult<(Self, Option<WorkflowActions>)> {
        let Self {
            state: wf_state,
            workflow_id,
        } = self;
        tracing::info!(workflow_id=?workflow_id, wf_state=?wf_state, action=?action, "[WorkflowWrapper::action] Running action on workflow");
        let next_state = wf_state.action(state, action, workflow_id.clone()).await?;
        let next_action = next_state.default_action();
        tracing::info!(workflow_id=?workflow_id, next_state=?next_state, next_action=?next_action, "[WorkflowWrapper::action] Action ran on workflow");
        let next = Self {
            state: next_state,
            workflow_id,
        };
        Ok((next, next_action))
    }

    #[tracing::instrument("WorkflowWrapper::run", skip(state))]
    pub async fn run(self, state: &State, action: WorkflowActions) -> ApiResult<Self> {
        let mut next_action = Some(action);
        let mut ww = self;
        while let Some(action) = next_action {
            (ww, next_action) = ww.action(state, action).await?;
        }
        Ok(ww)
    }
}
