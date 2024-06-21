pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::DoAction;
use super::StateError;
use super::Workflow;
use super::WorkflowActions;
use super::WorkflowKind;
use super::WorkflowState;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::rule_instance::IncludeRules;
use db::models::workflow::Workflow as DbWorkflow;
use enum_dispatch::enum_dispatch;
use newtypes::RuleInstanceKind;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::WorkflowId;

///
/// States

#[derive(Clone)]
pub struct KybDataCollection {
    wf_id: WorkflowId,
    t_id: TenantId,
    #[allow(unused)]
    sv_id: ScopedVaultId,
}

#[derive(Clone)]
pub struct KybAwaitingBoKyc {
    wf_id: WorkflowId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybVendorCalls {
    wf_id: WorkflowId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybAwaitingAsyncVendors {
    wf_id: WorkflowId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KybDecisioning {
    wf_id: WorkflowId,
    t_id: TenantId,
    include_rules: IncludeRules,
}

impl KybDecisioning {
    pub fn new(wf_id: WorkflowId, t_id: TenantId) -> Self {
        Self {
            wf_id,
            t_id,
            include_rules: IncludeRules::Kind(RuleInstanceKind::Business),
        }
    }
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
    pub async fn init(state: &State, workflow: DbWorkflow) -> FpResult<Self> {
        let newtypes::WorkflowState::Kyb(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into());
        };
        let newtypes::WorkflowConfig::Kyb(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into());
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
    ) -> FpResult<WorkflowKind> {
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
