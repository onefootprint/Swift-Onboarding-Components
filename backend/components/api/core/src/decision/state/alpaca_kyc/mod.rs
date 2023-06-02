pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::MakeDecision, DoAction, MakeVendorCalls, MakeWatchlistCheckCall, StateError, WorkflowActions,
    WorkflowWrapperState,
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
pub enum AlpacaKycState {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    WatchlistCheck(WatchlistCheck),
    PendingReview(PendingReview),
    DocCollection(DocCollection),
    Complete(Complete),
}

impl AlpacaKycState {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::AlpacaKyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::AlpacaKycState::DataCollection => DataCollection::init(state, workflow)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::VendorCalls => {
                VendorCalls::init(state, workflow).await.map(AlpacaKycState::from)
            }
            newtypes::AlpacaKycState::Decisioning => {
                Decisioning::init(state, workflow).await.map(AlpacaKycState::from)
            }
            newtypes::AlpacaKycState::WatchlistCheck => WatchlistCheck::init(state, workflow)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::PendingReview => PendingReview::init(state, workflow)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::DocCollection => DocCollection::init(state, workflow)
                .await
                .map(AlpacaKycState::from),
            newtypes::AlpacaKycState::Complete => {
                Complete::init(state, workflow).await.map(AlpacaKycState::from)
            }
        }
    }
}

#[async_trait]
impl super::WorkflowState for AlpacaKycState {
    fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            AlpacaKycState::DataCollection(_) => None, // have to wait for user to complete Bifrost
            AlpacaKycState::VendorCalls(_) => Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls)),
            AlpacaKycState::Decisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
            AlpacaKycState::WatchlistCheck(_) => {
                Some(WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall))
            }
            AlpacaKycState::PendingReview(_) => None, // have to wait for user to complete review
            AlpacaKycState::DocCollection(_) => None, // have to wait for doc collection flow to finish
            AlpacaKycState::Complete(_) => None,      // terminal state
        }
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<WorkflowWrapperState> {
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
        Ok(new_state.into())
    }
}

impl From<DataCollection> for AlpacaKycState {
    fn from(value: DataCollection) -> Self {
        AlpacaKycState::DataCollection(value)
    }
}

impl From<VendorCalls> for AlpacaKycState {
    fn from(value: VendorCalls) -> Self {
        AlpacaKycState::VendorCalls(value)
    }
}

impl From<Decisioning> for AlpacaKycState {
    fn from(value: Decisioning) -> Self {
        AlpacaKycState::Decisioning(value)
    }
}

impl From<WatchlistCheck> for AlpacaKycState {
    fn from(value: WatchlistCheck) -> Self {
        AlpacaKycState::WatchlistCheck(value)
    }
}

impl From<PendingReview> for AlpacaKycState {
    fn from(value: PendingReview) -> Self {
        AlpacaKycState::PendingReview(value)
    }
}

impl From<DocCollection> for AlpacaKycState {
    fn from(value: DocCollection) -> Self {
        AlpacaKycState::DocCollection(value)
    }
}
impl From<Complete> for AlpacaKycState {
    fn from(value: Complete) -> Self {
        AlpacaKycState::Complete(value)
    }
}

impl From<AlpacaKycState> for newtypes::WorkflowState {
    fn from(value: AlpacaKycState) -> Self {
        let alpaca_kyc_state = match value {
            AlpacaKycState::DataCollection(_) => newtypes::AlpacaKycState::DataCollection,
            AlpacaKycState::VendorCalls(_) => newtypes::AlpacaKycState::VendorCalls,
            AlpacaKycState::Decisioning(_) => newtypes::AlpacaKycState::Decisioning,
            AlpacaKycState::WatchlistCheck(_) => newtypes::AlpacaKycState::WatchlistCheck,
            AlpacaKycState::PendingReview(_) => newtypes::AlpacaKycState::PendingReview,
            AlpacaKycState::DocCollection(_) => newtypes::AlpacaKycState::DocCollection,
            AlpacaKycState::Complete(_) => newtypes::AlpacaKycState::Complete,
        };
        newtypes::WorkflowState::from(alpaca_kyc_state)
    }
}
