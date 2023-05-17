pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{HasStateName, StateError, WorkflowActions, WorkflowStates};
use crate::{errors::ApiResult, State};
use db::models::workflow::Workflow;

///
/// States
///

pub struct DataCollection;
pub struct VendorCalls;
pub struct Decisioning;
pub struct Complete;

pub enum States {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    Complete(Complete),
}

impl From<States> for WorkflowStates {
    fn from(value: States) -> Self {
        WorkflowStates::Kyc(value)
    }
}

///
/// Actions
///

pub struct Authorize;
pub struct MakeVendorCalls;
pub struct MakeDecision;

pub enum Actions {
    Authorize(Authorize),
    MakeVendorCalls(MakeVendorCalls),
    MakeDecision(MakeDecision),
}

impl From<Actions> for WorkflowActions {
    fn from(value: Actions) -> Self {
        WorkflowActions::Kyc(value)
    }
}

impl States {
    #[allow(irrefutable_let_patterns)] // just cause only 1 WorkflowState enum variant atm
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        match s {
            newtypes::KycState::DataCollection => {
                DataCollection::init(state, workflow).await.map(States::from)
            }
            newtypes::KycState::VendorCalls => VendorCalls::init(state, workflow).await.map(States::from),
            newtypes::KycState::Decisioning => Decisioning::init(state, workflow).await.map(States::from),
            newtypes::KycState::Complete => Complete::init(state, workflow).await.map(States::from),
        }
    }

    pub fn default_action(&self) -> Option<Actions> {
        match self {
            States::DataCollection(_) => None,
            States::VendorCalls(_) => Some(Actions::MakeVendorCalls(MakeVendorCalls)),
            States::Decisioning(_) => Some(Actions::MakeDecision(MakeDecision)),
            States::Complete(_) => None,
        }
    }
}

// more boiling plates
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

impl From<Complete> for States {
    fn from(value: Complete) -> Self {
        States::Complete(value)
    }
}

impl HasStateName for DataCollection {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::KycState::DataCollection.into()
    }
}
impl HasStateName for VendorCalls {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::KycState::VendorCalls.into()
    }
}
impl HasStateName for Decisioning {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::KycState::Decisioning.into()
    }
}
impl HasStateName for Complete {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::KycState::Complete.into()
    }
}

impl From<Authorize> for Actions {
    fn from(value: Authorize) -> Self {
        Actions::Authorize(value)
    }
}

impl From<MakeVendorCalls> for Actions {
    fn from(value: MakeVendorCalls) -> Self {
        Actions::MakeVendorCalls(value)
    }
}

impl From<MakeDecision> for Actions {
    fn from(value: MakeDecision) -> Self {
        Actions::MakeDecision(value)
    }
}

impl From<&States> for newtypes::KycState {
    fn from(value: &States) -> Self {
        match value {
            States::DataCollection(_) => Self::DataCollection,
            States::VendorCalls(_) => Self::VendorCalls,
            States::Decisioning(_) => Self::Decisioning,
            States::Complete(_) => Self::Complete,
        }
    }
}
