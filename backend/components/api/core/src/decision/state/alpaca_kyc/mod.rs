pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::MakeDecision, DoAction, MakeVendorCalls, MakeWatchlistCheckCall, StateError, WorkflowActions,
};
use crate::{decision::vendor::vendor_result::VendorResult, errors::ApiResult, State};
use async_trait::async_trait;
use db::models::workflow::Workflow;
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};

// For illustrative purposes currently

///
/// States
///

#[derive(Clone)]
pub struct DataCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct VendorCalls {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct Decisioning {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}
#[derive(Clone)]
pub struct WatchlistCheck {
    wf_id: WorkflowId, // TODO: make a common ctx type of dealio for all these shared things each state is using
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct PendingReview {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
}
#[derive(Clone)]
pub struct DocCollection {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}
#[derive(Clone)]
pub struct Complete;

#[derive(Clone)]
pub enum States {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    WatchlistCheck(WatchlistCheck),
    PendingReview(PendingReview),
    DocCollection(DocCollection),
    Complete(Complete),
}

#[async_trait]
impl super::WorkflowState for States {
    async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::AlpacaKyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::AlpacaKycState::DataCollection => {
                DataCollection::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::VendorCalls => {
                VendorCalls::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::Decisioning => {
                Decisioning::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::WatchlistCheck => {
                WatchlistCheck::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::PendingReview => {
                PendingReview::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::DocCollection => {
                DocCollection::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::Complete => Complete::init(state, workflow).await.map(States::from),
        }
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            States::DataCollection(_) => None, // have to wait for user to complete Bifrost
            States::VendorCalls(_) => Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls)),
            States::Decisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
            States::WatchlistCheck(_) => {
                Some(WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall))
            }
            States::PendingReview(_) => None, // have to wait for user to complete review
            States::DocCollection(_) => None, // have to wait for doc collection flow to finish
            States::Complete(_) => None,      // terminal state
        }
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<Self> {
        // TODO could get rid of this with enum_dispatch if actions are not typed
        // or if DoAction takes in a `WorkflowActions`
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
        Ok(new_state)
    }
}

impl From<DataCollection> for States {
    fn from(value: DataCollection) -> Self {
        States::DataCollection(value)
    }
}

impl From<VendorCalls> for States {
    fn from(value: VendorCalls) -> Self {
        States::VendorCalls(value)
    }
}

impl From<Decisioning> for States {
    fn from(value: Decisioning) -> Self {
        States::Decisioning(value)
    }
}

impl From<WatchlistCheck> for States {
    fn from(value: WatchlistCheck) -> Self {
        States::WatchlistCheck(value)
    }
}

impl From<PendingReview> for States {
    fn from(value: PendingReview) -> Self {
        States::PendingReview(value)
    }
}

impl From<DocCollection> for States {
    fn from(value: DocCollection) -> Self {
        States::DocCollection(value)
    }
}
impl From<Complete> for States {
    fn from(value: Complete) -> Self {
        States::Complete(value)
    }
}

impl From<States> for newtypes::WorkflowState {
    fn from(value: States) -> Self {
        let alpaca_kyc_state = match value {
            States::DataCollection(_) => newtypes::AlpacaKycState::DataCollection,
            States::VendorCalls(_) => newtypes::AlpacaKycState::VendorCalls,
            States::Decisioning(_) => newtypes::AlpacaKycState::Decisioning,
            States::WatchlistCheck(_) => newtypes::AlpacaKycState::WatchlistCheck,
            States::PendingReview(_) => newtypes::AlpacaKycState::PendingReview,
            States::DocCollection(_) => newtypes::AlpacaKycState::DocCollection,
            States::Complete(_) => newtypes::AlpacaKycState::Complete,
        };
        newtypes::WorkflowState::from(alpaca_kyc_state)
    }
}
