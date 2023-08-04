pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{DoAction, StateError, Workflow, WorkflowActions, WorkflowKind, WorkflowState};
use crate::{errors::ApiResult, State};
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use enum_dispatch::enum_dispatch;
use newtypes::{OnboardingId, TenantId, WorkflowId};

///
/// States
///

#[derive(Clone)]
pub struct KybDataCollection {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybAwaitingBoKyc {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybVendorCalls {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybAwaitingAsyncVendors {
    wf_id: WorkflowId,
}

#[derive(Clone)]
pub struct KybDecisioning {
    #[allow(dead_code)]
    wf_id: WorkflowId,
}

#[derive(Clone)]
pub struct KybComplete;

#[derive(Clone)]
#[enum_dispatch(WorkflowState)]
pub enum KybState {
    DataCollection(KybDataCollection),
    AwaitingBoKyc(KybAwaitingBoKyc),
    VendorCalls(KybVendorCalls),
    AwaitingAsyncVendors(KybAwaitingAsyncVendors),
    Decisioning(KybDecisioning),
    Complete(KybComplete),
}

impl KybState {
    pub async fn init(state: &State, workflow: DbWorkflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyb(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::Kyb(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
        };

        match s {
            newtypes::KybState::DataCollection => KybDataCollection::init(state, workflow, c)
                .await
                .map(KybState::from),
            newtypes::KybState::AwaitingBoKyc => KybAwaitingBoKyc::init(state, workflow, c)
                .await
                .map(KybState::from),
            newtypes::KybState::VendorCalls => {
                KybVendorCalls::init(state, workflow, c).await.map(KybState::from)
            }
            newtypes::KybState::AwaitingAsyncVendors => KybAwaitingAsyncVendors::init(state, workflow, c)
                .await
                .map(KybState::from),
            newtypes::KybState::Decisioning => {
                KybDecisioning::init(state, workflow, c).await.map(KybState::from)
            }
            newtypes::KybState::Complete => KybComplete::init(state, workflow, c).await.map(KybState::from),
        }
    }
}

#[async_trait]
impl Workflow for KybState {
    fn default_action(&self) -> Option<WorkflowActions> {
        <Self as WorkflowState>::default_action(self)
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<WorkflowKind> {
        let new_state = match (self, action) {
            (Self::DataCollection(s), WorkflowActions::Authorize(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::AwaitingBoKyc(s), WorkflowActions::BoKycCompleted(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::VendorCalls(s), WorkflowActions::MakeVendorCalls(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::AwaitingAsyncVendors(s), WorkflowActions::AsyncVendorCallsCompleted(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::Decisioning(s), WorkflowActions::MakeDecision(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (_, _) => return Err(StateError::UnexpectedActionForState.into()),
        };
        Ok(new_state.into())
    }
}
