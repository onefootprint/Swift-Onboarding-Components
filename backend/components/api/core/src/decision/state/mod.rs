use async_trait::async_trait;
use db::{models::workflow::Workflow, TxnPgConn};
use newtypes::WorkflowId;
use thiserror::Error;

use crate::{errors::ApiResult, State};

pub mod alpaca_kyc;
pub mod kyc;

pub trait HasStateName {
    fn state_name(&self) -> newtypes::WorkflowState;
}

// Implement this for a State to indicate that when in that State, the workflow responds to action A.
// When the action is triggered, a PG txn will be opened and the workflow in PG will be locked. The workflow's current state will be asserted
// (to confirm it hasn't been concurrently updated already) and then the workflow's state will be updated to the new state returned by `on_commit`.
// Other PG writes that need to occur atomically at the same time, can be done with the `conn`.
// If there are async actions that cannot be done within that conn, they can be specified in `execute_async_idempotent_actions`. This will execute first
// and the output of this will be passed into `on_commit`. The actions taken in this function should be (1) idempotent and (2) always leave
// PG data in a consistent/valid state for the current state the workflow is in, even in the case of errors
#[async_trait]
pub trait OnAction<A>: Send + 'static {
    type AsyncRes: Send + 'static;

    async fn execute_async_idempotent_actions(&self, action: A, state: &State) -> ApiResult<Self::AsyncRes>;
    // TODO: maybe in future this could be modeled as Actions vs Transitions. So OnAction, you perform the action and then return a Transition
    // which actually encapsulates the new state and whatever other writes need to occur for that state
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut TxnPgConn) -> ApiResult<WorkflowStates>;
}

#[derive(Debug, Error)]
pub enum StateError {
    #[error("Unexpected action for state")]
    UnexpectedActionForState, // TODO: paramaterize
    #[error("Unexpected state: {0} for workflow: {1}")]
    UnexpectedStateForWorkflow(newtypes::WorkflowState, WorkflowId),
    #[error("Attempted to transition state, but state has been modified. Expected: {0}, found state: {1}")]
    ConcurrentStateChange(newtypes::WorkflowState, newtypes::WorkflowState),
}

pub enum WorkflowStates {
    Kyc(kyc::States),
    AlpacaKyc(alpaca_kyc::States),
}

impl WorkflowStates {
    // Some states have just 1 single action which does not require awaiting anything (eg: user hitting API or a webhook)
    // When an instance of our state machine transitions into one of those states, we often (or mb always) want to go ahead and proceed with
    // that singular outgoing action. And progress in that fashion until we get to a state that is either (1) terminal or (2) requires awaiting
    pub fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            WorkflowStates::Kyc(v) => v.default_action().map(|x| x.into()),
            WorkflowStates::AlpacaKyc(v) => v.default_action().map(|x| x.into()),
        }
    }
}

pub enum WorkflowActions {
    Kyc(kyc::Actions),
    AlpacaKyc(alpaca_kyc::Actions),
}

impl From<&WorkflowStates> for newtypes::WorkflowState {
    fn from(value: &WorkflowStates) -> Self {
        match value {
            WorkflowStates::Kyc(v) => newtypes::KycState::from(v).into(),
            WorkflowStates::AlpacaKyc(v) => newtypes::AlpacaKycState::from(v).into(),
        }
    }
}

struct WorkflowWrapper {
    pub state: WorkflowStates,
    pub workflow_id: WorkflowId,
}

impl WorkflowWrapper {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let workflow_id = workflow.id.clone();
        let s: WorkflowStates = match workflow.state {
            newtypes::WorkflowState::Kyc(_v) => kyc::States::init(state, workflow).await?.into(),
            newtypes::WorkflowState::AlpacaKyc(_v) => alpaca_kyc::States::init(state, workflow).await?.into(),
        };
        Ok(Self {
            state: s,
            workflow_id,
        })
    }

    pub async fn do_action<T, A>(
        state: &State,
        s: T,
        action: A,
        workflow_id: WorkflowId,
    ) -> ApiResult<WorkflowStates>
    where
        T: OnAction<A> + HasStateName,
    {
        let r = s.execute_async_idempotent_actions(action, state).await?;
        let current_state = s.state_name(); // this sucks
        state
            .db_pool
            .db_transaction(move |conn| {
                let wf = Workflow::lock(conn, &workflow_id)?;
                if wf.state != current_state {
                    Err(StateError::ConcurrentStateChange(current_state, wf.state.clone()))?
                }
                let new_state = s.on_commit(r, conn)?;
                let new_wf_state: newtypes::WorkflowState = newtypes::WorkflowState::from(&new_state);
                Workflow::update_state(conn, wf, new_wf_state)?;
                Ok(new_state)
            })
            .await
    }

    pub async fn action(self, state: &State, action: WorkflowActions) -> ApiResult<WorkflowWrapper> {
        let wf_id = self.workflow_id.clone();
        let new_state = match (self.state, action) {
            // (WorkflowStates::Kyc(s), WorklowActions::Kyc(a)) => Ok(s.action(state, a).await?.into()),
            (WorkflowStates::Kyc(s), WorkflowActions::Kyc(a)) => match (s, a) {
                (kyc::States::DataCollection(s), kyc::Actions::Authorize(a)) => {
                    Self::do_action(state, s, a, self.workflow_id).await
                }
                (kyc::States::VendorCalls(s), kyc::Actions::MakeVendorCalls(a)) => {
                    Self::do_action(state, s, a, self.workflow_id).await
                }
                (kyc::States::Decisioning(s), kyc::Actions::MakeDecision(a)) => {
                    Self::do_action(state, s, a, self.workflow_id).await
                }
                (_, _) => Err(StateError::UnexpectedActionForState.into()),
            },
            (WorkflowStates::AlpacaKyc(s), WorkflowActions::AlpacaKyc(a)) => match (s, a) {
                (alpaca_kyc::States::KycDecisioning(s), alpaca_kyc::Actions::MakeKycDecision(a)) => {
                    Self::do_action(state, s, a, self.workflow_id).await
                }
                (alpaca_kyc::States::AdverseMediaCall(s), alpaca_kyc::Actions::MakeAdverseMediaCall(a)) => {
                    Self::do_action(state, s, a, self.workflow_id).await
                }
                (_, _) => Err(StateError::UnexpectedActionForState.into()),
            },
            (_, _) => Err(StateError::UnexpectedActionForState.into()),
        }?;
        Ok(WorkflowWrapper {
            state: new_state,
            workflow_id: wf_id,
        })
    }

    pub async fn run(self, state: &State, action: WorkflowActions) -> ApiResult<WorkflowWrapper> {
        let mut ww: WorkflowWrapper = self.action(state, action).await?;
        let mut next_action = ww.state.default_action();
        while let Some(nt) = next_action {
            ww = ww.action(state, nt).await?;
            next_action = ww.state.default_action();
        }
        Ok(ww)
    }
}
