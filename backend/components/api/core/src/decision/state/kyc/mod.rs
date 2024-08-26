pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::actions::MakeDecision;
use super::actions::MakeVendorCalls;
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
use newtypes::DataLifetimeSeqno;
use newtypes::RuleInstanceKind;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::WorkflowId;

///
/// States

#[derive(Clone)]
pub struct KycDataCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    seqno: DataLifetimeSeqno,
}

#[derive(Clone)]
pub struct KycVendorCalls {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    seqno: DataLifetimeSeqno,
}

#[derive(Clone)]
pub struct KycDecisioning {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    include_rules: IncludeRules,
    seqno: DataLifetimeSeqno,
}
impl KycDecisioning {
    pub fn new(wf_id: WorkflowId, sv_id: ScopedVaultId, t_id: TenantId, seqno: DataLifetimeSeqno) -> Self {
        Self {
            wf_id,
            sv_id,
            t_id,
            include_rules: IncludeRules::Kind(RuleInstanceKind::Person),
            seqno,
        }
    }
}

#[derive(Clone)]
pub struct KycDocCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    seqno: DataLifetimeSeqno,
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
    pub async fn init(state: &State, workflow: DbWorkflow, seqno: DataLifetimeSeqno) -> FpResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into());
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into());
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::KycState::DataCollection => KycDataCollection::init(state, workflow, c, seqno)
                .await
                .map(KycState::from),
            newtypes::KycState::VendorCalls => KycVendorCalls::init(state, workflow, c, seqno)
                .await
                .map(KycState::from),
            newtypes::KycState::Decisioning => KycDecisioning::init(state, workflow, c, seqno)
                .await
                .map(KycState::from),
            newtypes::KycState::Complete => KycComplete::init(state, workflow, c, seqno)
                .await
                .map(KycState::from),
            newtypes::KycState::DocCollection => KycDocCollection::init(state, workflow, c, seqno)
                .await
                .map(KycState::from),
        }
    }
}

#[async_trait]
impl Workflow for KycState {
    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        <Self as WorkflowState>::default_action(self, seqno)
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
