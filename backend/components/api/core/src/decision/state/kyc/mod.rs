pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::{MakeDecision, MakeVendorCalls},
    DoAction, StateError, Workflow, WorkflowActions, WorkflowKind, WorkflowState,
};
use crate::{errors::ApiResult, State};
use async_trait::async_trait;
use db::models::{rule_instance::IncludeRules, workflow::Workflow as DbWorkflow};
use enum_dispatch::enum_dispatch;
use newtypes::{RuleInstanceKind, ScopedVaultId, TenantId, WorkflowId};

///
/// States
///

#[derive(Clone)]
pub struct KycDataCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KycVendorCalls {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KycDecisioning {
    #[allow(unused)]
    wf_id: WorkflowId,
    #[allow(unused)]
    sv_id: ScopedVaultId,
    t_id: TenantId,
    include_rules: IncludeRules,
}
impl KycDecisioning {
    pub fn new(wf_id: WorkflowId, sv_id: ScopedVaultId, t_id: TenantId) -> Self {
        Self {
            wf_id,
            sv_id,
            t_id,
            include_rules: IncludeRules::Kind(RuleInstanceKind::Person),
        }
    }
}

#[derive(Clone)]
pub struct KycDocCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KycComplete;

#[derive(Clone)]
#[enum_dispatch(WorkflowState)]
pub enum KycState {
    DataCollection(KycDataCollection),
    VendorCalls(KycVendorCalls),
    Decisioning(KycDecisioning),
    Complete(KycComplete),
    DocCollection(KycDocCollection),
}

impl KycState {
    #[tracing::instrument(skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into());
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into());
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::KycState::DataCollection => KycDataCollection::init(state, workflow, c)
                .await
                .map(KycState::from),
            newtypes::KycState::VendorCalls => {
                KycVendorCalls::init(state, workflow, c).await.map(KycState::from)
            }
            newtypes::KycState::Decisioning => {
                KycDecisioning::init(state, workflow, c).await.map(KycState::from)
            }
            newtypes::KycState::Complete => KycComplete::init(state, workflow, c).await.map(KycState::from),
            newtypes::KycState::DocCollection => KycDocCollection::init(state, workflow, c)
                .await
                .map(KycState::from),
        }
    }
}

#[async_trait]
impl Workflow for KycState {
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
            (Self::VendorCalls(s), WorkflowActions::MakeVendorCalls(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::Decisioning(s), WorkflowActions::MakeDecision(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::DocCollection(s), WorkflowActions::DocCollected(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (_, _) => return Err(StateError::UnexpectedActionForState.into()),
        };
        Ok(new_state.into())
    }
}
