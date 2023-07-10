use super::actions::WorkflowActions;
use super::StateError;
use super::WorkflowKind;
use crate::decision::onboarding::RuleGroup;
use crate::task;
use crate::{errors::ApiResult, State};
use async_trait::async_trait;
use db::{models::workflow::Workflow as DbWorkflow, TxnPgConn};
use enum_dispatch::enum_dispatch;
use newtypes::WorkflowId;

// These are needed for enum_dispatch to work properly
use super::alpaca_kyc::*;
use super::document::*;
use super::kyc::*;

#[enum_dispatch]
/// Provides basic functionality that all WorkflowStates should have
pub(super) trait WorkflowState: std::marker::Send + std::marker::Sync + 'static {
    fn name(&self) -> newtypes::WorkflowState;

    fn default_action(&self) -> Option<WorkflowActions>;
}

pub trait HasRuleGroup {
    fn rule_group(&self) -> RuleGroup;
}

/// Implement this for a State to indicate that when in that State, the workflow responds to action A.
/// When the action is triggered, a PG txn will be opened and the workflow in PG will be locked. The workflow's current state will be asserted
/// (to confirm it hasn't been concurrently updated already) and then the workflow's state will be updated to the new state returned by `on_commit`.
/// Other PG writes that need to occur atomically at the same time, can be done with the `conn`.
/// If there are async actions that cannot be done within that conn, they can be specified in `execute_async_idempotent_actions`. This will execute first
/// and the output of this will be passed into `on_commit`. The actions taken in this function should be (1) idempotent and (2) always leave
/// PG data in a consistent/valid state for the current state the workflow is in, even in the case of errors
#[async_trait]
pub(super) trait OnAction<TAction, TWorkflow>: WorkflowState + Clone {
    type AsyncRes: std::marker::Send + 'static;

    async fn execute_async_idempotent_actions(
        &self,
        action: TAction,
        state: &State,
    ) -> ApiResult<Self::AsyncRes>;
    // TODO: maybe in future this could be modeled as Actions vs Transitions. So OnAction, you perform the action and then return a Transition
    // which actually encapsulates the new state and whatever other writes need to occur for that state
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut TxnPgConn) -> ApiResult<TWorkflow>;
}

#[async_trait]
/// Provides an automatic implementation to handle a given TAction for types that implement OnAction<TAction>
pub(super) trait DoAction<TAction, TWorkflow> {
    async fn do_action(self, state: &State, action: TAction, workflow_id: WorkflowId)
        -> ApiResult<TWorkflow>;
}

#[async_trait]
impl<T, TAction, TWorkflow> DoAction<TAction, TWorkflow> for T
where
    T: OnAction<TAction, TWorkflow>,
    TAction: std::marker::Send + 'static + std::fmt::Debug,
    TWorkflow: Workflow + Clone,
{
    #[tracing::instrument(
        "<T, TAction, TWorkflow> DoAction<TAction, TWorkflow>::do_action",
        skip(self, state)
    )]
    async fn do_action(
        self,
        state: &State,
        action: TAction,
        workflow_id: WorkflowId,
    ) -> ApiResult<TWorkflow> {
        let r = self.execute_async_idempotent_actions(action, state).await?;
        let current_state = self.name();
        let result = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let wf = DbWorkflow::lock(conn, &workflow_id)?;
                if wf.state != current_state {
                    Err(StateError::ConcurrentStateChange(current_state, wf.state))?
                }
                let new_state = self.on_commit(r, conn)?;
                DbWorkflow::update_state(conn, wf, newtypes::WorkflowState::from(&new_state.clone().into()))?;
                Ok(new_state)
            })
            .await?;
        // Various workflows can do Onboarding::update which creates Task's for webhooks
        // Until we get comfortable with a proper daemon/worker machines executing these Tasks continually, we need to manually prompt execution
        task::execute_webhook_tasks(state.clone());
        Ok(result)
    }
}

#[async_trait]
#[enum_dispatch]
/// Common functionality for all Workflows, which are bundles of WorkflowStates and the transistions between them
pub trait Workflow: Clone + Into<WorkflowKind> + std::marker::Send + std::marker::Sync + 'static {
    fn default_action(&self) -> Option<WorkflowActions>;

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<WorkflowKind>;
}
