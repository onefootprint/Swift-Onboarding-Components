pub mod states;

use super::{
    actions::MakeDecision, HasStateName, MakeVendorCalls, MakeWatchlistCheckCall, StateError,
    WorkflowActions, WorkflowStates,
};
use crate::{decision::vendor::vendor_result::VendorResult, errors::ApiResult, State};
use db::models::workflow::Workflow;
use newtypes::{OnboardingId, ScopedVaultId, TenantId};

// For illustrative purposes currently

///
/// States
///

pub struct DataCollection {
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
pub struct VendorCalls {
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}
pub struct Decisioning {
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}
pub struct WatchlistCheck {
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}
pub struct PendingReview;
pub struct DocCollection {
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}
pub struct Complete;

pub enum States {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    WatchlistCheck(WatchlistCheck),
    PendingReview(PendingReview),
    DocCollection(DocCollection),
    Complete(Complete),
}

impl From<States> for WorkflowStates {
    fn from(value: States) -> Self {
        WorkflowStates::AlpacaKyc(value)
    }
}

impl States {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::AlpacaKyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
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

    pub fn default_action(&self) -> Option<WorkflowActions> {
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

impl HasStateName for DataCollection {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::DataCollection.into()
    }
}

impl HasStateName for VendorCalls {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::VendorCalls.into()
    }
}

impl HasStateName for Decisioning {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::Decisioning.into()
    }
}

impl HasStateName for WatchlistCheck {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::WatchlistCheck.into()
    }
}

impl HasStateName for PendingReview {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::PendingReview.into()
    }
}

impl HasStateName for DocCollection {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::DocCollection.into()
    }
}

impl HasStateName for Complete {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::Complete.into()
    }
}

impl From<&States> for newtypes::AlpacaKycState {
    fn from(value: &States) -> Self {
        match value {
            States::DataCollection(_) => Self::DataCollection,
            States::VendorCalls(_) => Self::VendorCalls,
            States::Decisioning(_) => Self::Decisioning,
            States::WatchlistCheck(_) => Self::WatchlistCheck,
            States::PendingReview(_) => Self::PendingReview,
            States::DocCollection(_) => Self::DocCollection,
            States::Complete(_) => Self::Complete,
        }
    }
}
