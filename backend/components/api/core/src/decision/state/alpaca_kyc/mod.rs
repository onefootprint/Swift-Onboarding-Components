pub mod states;

use super::{
    actions::{MakeAdverseMediaCall, MakeDecision},
    HasStateName, StateError, WorkflowActions, WorkflowStates,
};
use crate::{errors::ApiResult, State};
use db::models::workflow::Workflow;

// For illustrative purposes currently

///
/// States
///

pub struct KycDecisioning;
pub struct AdverseMediaCall;
pub struct AlpacaCall;

pub enum States {
    KycDecisioning(KycDecisioning),
    AdverseMediaCall(AdverseMediaCall),
    AlpacaCall(AlpacaCall),
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
            newtypes::AlpacaKycState::KycDecisioning => {
                KycDecisioning::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::AdverseMediaCall => {
                AdverseMediaCall::init(state, workflow).await.map(States::from)
            }
            newtypes::AlpacaKycState::AlpacaCall => AlpacaCall::init(state, workflow).await.map(States::from),
        }
    }

    pub fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            States::KycDecisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
            States::AdverseMediaCall(_) => Some(WorkflowActions::MakeAdverseMediaCall(MakeAdverseMediaCall)),
            States::AlpacaCall(_) => None,
        }
    }
}

impl From<KycDecisioning> for States {
    fn from(value: KycDecisioning) -> Self {
        States::KycDecisioning(value)
    }
}

impl From<AdverseMediaCall> for States {
    fn from(value: AdverseMediaCall) -> Self {
        States::AdverseMediaCall(value)
    }
}

impl From<AlpacaCall> for States {
    fn from(value: AlpacaCall) -> Self {
        States::AlpacaCall(value)
    }
}

impl HasStateName for KycDecisioning {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::KycDecisioning.into()
    }
}
impl HasStateName for AdverseMediaCall {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::AdverseMediaCall.into()
    }
}
impl HasStateName for AlpacaCall {
    fn state_name(&self) -> newtypes::WorkflowState {
        newtypes::AlpacaKycState::AlpacaCall.into()
    }
}

impl From<&States> for newtypes::AlpacaKycState {
    fn from(value: &States) -> Self {
        match value {
            States::KycDecisioning(_) => Self::KycDecisioning,
            States::AdverseMediaCall(_) => Self::AdverseMediaCall,
            States::AlpacaCall(_) => Self::AlpacaCall,
        }
    }
}
