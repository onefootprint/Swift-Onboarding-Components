pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    traits::HasRuleGroup, DoAction, StateError, Workflow, WorkflowActions, WorkflowKind, WorkflowState,
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

// For illustrative purposes currently

///
/// States
///

#[derive(Clone)]
pub struct AlpacaKycDataCollection {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct AlpacaKycVendorCalls {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct AlpacaKycDecisioning {
    wf_id: WorkflowId,
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}

impl HasRuleGroup for AlpacaKycDecisioning {
    fn rule_group(&self) -> RuleGroup {
        RuleGroup::Kyc(KycRuleGroup {
            idology_rules: rule_sets::alpaca::idology_rule_set(),
            experian_rules: rule_sets::alpaca::experian_rule_set(),
        })
    }
}
#[derive(Clone)]
pub struct AlpacaKycWatchlistCheck {
    wf_id: WorkflowId, // TODO: make a common ctx type of dealio for all these shared things each state is using
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

impl HasRuleGroup for AlpacaKycWatchlistCheck {
    fn rule_group(&self) -> RuleGroup {
        RuleGroup::Kyc(KycRuleGroup {
            idology_rules: rule_sets::alpaca::idology_rule_set(),
            experian_rules: rule_sets::alpaca::experian_rule_set(),
        })
    }
}

#[derive(Clone)]
pub struct AlpacaKycPendingReview {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
}
#[derive(Clone)]
pub struct AlpacaKycDocCollection {
    wf_id: WorkflowId,
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct AlpacaKycComplete;

#[derive(Clone)]
#[enum_dispatch(WorkflowState)]
pub enum AlpacaKycState {
    DataCollection(AlpacaKycDataCollection),
    VendorCalls(AlpacaKycVendorCalls),
    Decisioning(AlpacaKycDecisioning),
    WatchlistCheck(AlpacaKycWatchlistCheck),
    PendingReview(AlpacaKycPendingReview),
    DocCollection(AlpacaKycDocCollection),
    Complete(AlpacaKycComplete),
}

impl AlpacaKycState {
    pub async fn init(state: &State, workflow: DbWorkflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::AlpacaKyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::AlpacaKyc(config) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::AlpacaKycState::DataCollection => {
                AlpacaKycDataCollection::init(state, workflow, config)
                    .await
                    .map(AlpacaKycState::from)
            }
            newtypes::AlpacaKycState::VendorCalls => AlpacaKycVendorCalls::init(state, workflow, config)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::Decisioning => AlpacaKycDecisioning::init(state, workflow, config)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::WatchlistCheck => {
                AlpacaKycWatchlistCheck::init(state, workflow, config)
                    .await
                    .map(AlpacaKycState::from)
            }
            newtypes::AlpacaKycState::PendingReview => AlpacaKycPendingReview::init(state, workflow, config)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::DocCollection => AlpacaKycDocCollection::init(state, workflow, config)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::Complete => AlpacaKycComplete::init(state, workflow, config)
                .await
                .map(AlpacaKycState::from),
        }
    }
}

#[async_trait]
impl Workflow for AlpacaKycState {
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
            (Self::WatchlistCheck(s), WorkflowActions::MakeWatchlistCheckCall(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (Self::PendingReview(s), WorkflowActions::ReviewCompleted(a)) => {
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
