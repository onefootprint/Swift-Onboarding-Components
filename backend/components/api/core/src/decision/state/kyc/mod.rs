pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::{MakeDecision, MakeVendorCalls},
    HasStateName, OnAction, StateError, WorkflowActions, WorkflowStates,
};
use crate::{decision::vendor::vendor_result::VendorResult, errors::ApiResult, State};
use db::models::workflow::Workflow;
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};

///
/// States
///

pub struct DataCollection {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

pub struct VendorCalls {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

pub struct Decisioning {
    wf_id: WorkflowId,
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}

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

impl States {
    #[allow(irrefutable_let_patterns)] // just cause only 1 WorkflowState enum variant atm
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
        };
        match s {
            newtypes::KycState::DataCollection => {
                DataCollection::init(state, workflow, c).await.map(States::from)
            }
            newtypes::KycState::VendorCalls => VendorCalls::init(state, workflow, c).await.map(States::from),
            newtypes::KycState::Decisioning => Decisioning::init(state, workflow, c).await.map(States::from),
            newtypes::KycState::Complete => Complete::init(state, workflow, c).await.map(States::from),
        }
    }

    pub fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            States::DataCollection(_) => None,
            States::VendorCalls(_) => Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls)),
            States::Decisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
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
