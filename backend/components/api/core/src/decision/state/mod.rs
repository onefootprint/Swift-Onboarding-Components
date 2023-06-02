use async_trait::async_trait;
use db::{models::workflow::Workflow, TxnPgConn};
use enum_dispatch::enum_dispatch;
use newtypes::WorkflowId;
use thiserror::Error;

use crate::{errors::ApiResult, ApiError, State};

use self::actions::WorkflowActions;

pub mod actions;
pub use actions::*;
pub mod alpaca_kyc;
pub mod common;
pub mod kyc;

// Implement this for a State to indicate that when in that State, the workflow responds to action A.
// When the action is triggered, a PG txn will be opened and the workflow in PG will be locked. The workflow's current state will be asserted
// (to confirm it hasn't been concurrently updated already) and then the workflow's state will be updated to the new state returned by `on_commit`.
// Other PG writes that need to occur atomically at the same time, can be done with the `conn`.
// If there are async actions that cannot be done within that conn, they can be specified in `execute_async_idempotent_actions`. This will execute first
// and the output of this will be passed into `on_commit`. The actions taken in this function should be (1) idempotent and (2) always leave
// PG data in a consistent/valid state for the current state the workflow is in, even in the case of errors
#[async_trait]
pub trait OnAction<TAction, TState>:
    Clone + std::marker::Send + std::marker::Sync + 'static + Into<TState>
{
    type AsyncRes: std::marker::Send + 'static;

    async fn execute_async_idempotent_actions(
        &self,
        action: TAction,
        state: &State,
    ) -> ApiResult<Self::AsyncRes>;
    // TODO: maybe in future this could be modeled as Actions vs Transitions. So OnAction, you perform the action and then return a Transition
    // which actually encapsulates the new state and whatever other writes need to occur for that state
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut TxnPgConn) -> ApiResult<TState>;
}

#[async_trait]
trait DoAction<TAction, TState> {
    async fn do_action(self, state: &State, action: TAction, workflow_id: WorkflowId) -> ApiResult<TState>;
}

#[async_trait]
impl<T, TAction, TState> DoAction<TAction, TState> for T
where
    T: OnAction<TAction, TState>,
    TAction: std::marker::Send + 'static,
    TState: WorkflowState,
{
    async fn do_action(self, state: &State, action: TAction, workflow_id: WorkflowId) -> ApiResult<TState> {
        let r = self.execute_async_idempotent_actions(action, state).await?;
        let current_state = self.clone().into().into();
        let result = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let wf = Workflow::lock(conn, &workflow_id)?;
                if wf.state != current_state {
                    Err(StateError::ConcurrentStateChange(current_state, wf.state.clone()))?
                }
                let new_state = self.on_commit(r, conn)?;
                Workflow::update_state(conn, wf, new_state.clone().into())?;
                Ok(new_state)
            })
            .await?;
        Ok(result)
    }
}

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
}

#[async_trait]
pub trait WorkflowState: Clone + Into<newtypes::WorkflowState> + std::marker::Send + 'static {
    async fn init(state: &State, workflow: Workflow) -> ApiResult<Self>;

    fn default_action(&self) -> Option<WorkflowActions>;

    async fn action(self, state: &State, action: WorkflowActions, workflow_id: WorkflowId)
        -> ApiResult<Self>;
}

pub enum WorkflowWrapperState {
    Kyc(kyc::States),
    AlpacaKyc(alpaca_kyc::States),
}

impl From<kyc::States> for WorkflowWrapperState {
    fn from(value: kyc::States) -> Self {
        Self::Kyc(value)
    }
}

impl From<alpaca_kyc::States> for WorkflowWrapperState {
    fn from(value: alpaca_kyc::States) -> Self {
        Self::AlpacaKyc(value)
    }
}

impl From<WorkflowWrapperState> for newtypes::WorkflowState {
    fn from(value: WorkflowWrapperState) -> Self {
        match value {
            WorkflowWrapperState::Kyc(s) => s.into(),
            WorkflowWrapperState::AlpacaKyc(s) => s.into(),
        }
    }
}

/// Wraps any WorkflowWrapperState to provide util methods to initialize a workflow from its
/// serialized form in the DB and run the workflow.
pub struct WorkflowWrapper {
    pub state: WorkflowWrapperState,
    pub workflow_id: WorkflowId,
}

impl WorkflowWrapper {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let workflow_id = workflow.id.clone();
        let s = match workflow.state {
            newtypes::WorkflowState::Kyc(s) => kyc::States::init(state, workflow).await?.into(),
            newtypes::WorkflowState::AlpacaKyc(s) => alpaca_kyc::States::init(state, workflow).await?.into(),
        };
        Ok(Self {
            state: s,
            workflow_id,
        })
    }

    pub async fn action(
        self,
        state: &State,
        action: WorkflowActions,
    ) -> ApiResult<(Self, Option<WorkflowActions>)> {
        // TODO get rid of this with enum_dispatch
        let Self {
            state: wf_state,
            workflow_id,
        } = self;
        let wf_id = workflow_id.clone();
        let (next_action, next_state) = match wf_state {
            WorkflowWrapperState::Kyc(wf_state) => {
                let next_state = wf_state.action(state, action, wf_id).await?;
                (next_state.default_action(), next_state.into())
            }
            WorkflowWrapperState::AlpacaKyc(wf_state) => {
                let next_state = wf_state.action(state, action, wf_id).await?;
                (next_state.default_action(), next_state.into())
            }
        };
        let next = Self {
            state: next_state,
            workflow_id,
        };
        Ok((next, next_action))
    }

    pub async fn run(self, state: &State, action: WorkflowActions) -> ApiResult<Self> {
        let mut next_action = Some(action);
        let mut ww = self;
        while let Some(action) = next_action {
            (ww, next_action) = ww.action(state, action).await?;
        }
        Ok(ww)
    }
}
