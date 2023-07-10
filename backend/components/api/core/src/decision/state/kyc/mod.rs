pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::{MakeDecision, MakeVendorCalls},
    traits::HasRuleGroup,
    DoAction, StateError, Workflow, WorkflowActions, WorkflowKind, WorkflowState,
};
use crate::{
    decision::{
        onboarding::{KycRuleGroup, RuleGroup},
        rule::rule_sets,
        vendor::vendor_result::VendorResult,
    },
    errors::ApiResult,
    State,
};
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use enum_dispatch::enum_dispatch;
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};

///
/// States
///

#[derive(Clone)]
pub struct KycDataCollection {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KycVendorCalls {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct KycDecisioning {
    wf_id: WorkflowId,
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}

impl HasRuleGroup for KycDecisioning {
    fn rule_group(&self) -> RuleGroup {
        RuleGroup::Kyc(KycRuleGroup {
            idology_rules: rule_sets::kyc::idology_rule_set(),
            experian_rules: rule_sets::kyc::experian_rule_set(),
        })
    }
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
}

impl KycState {
    #[tracing::instrument(skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
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
            (_, _) => return Err(StateError::UnexpectedActionForState.into()),
        };
        Ok(new_state.into())
    }
}
