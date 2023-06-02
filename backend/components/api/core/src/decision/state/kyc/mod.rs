pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::{MakeDecision, MakeVendorCalls},
    DoAction, OnAction, StateError, WorkflowActions,
};
use crate::{decision::vendor::vendor_result::VendorResult, errors::ApiResult, State};
use async_trait::async_trait;
use db::models::workflow::Workflow;
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};

///
/// States
///

#[derive(Clone)]
pub struct DataCollection {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct VendorCalls {
    wf_id: WorkflowId,
    is_redo: bool,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct Decisioning {
    wf_id: WorkflowId,
    is_redo: bool,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
    vendor_results: Vec<VendorResult>,
}

#[derive(Clone)]
pub struct Complete;

#[derive(Clone)]
pub enum States {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    Complete(Complete),
}

#[async_trait]
impl super::WorkflowState for States {
    async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::KycState::DataCollection => {
                DataCollection::init(state, workflow, c).await.map(States::from)
            }
            newtypes::KycState::VendorCalls => VendorCalls::init(state, workflow, c).await.map(States::from),
            newtypes::KycState::Decisioning => Decisioning::init(state, workflow, c).await.map(States::from),
            newtypes::KycState::Complete => Complete::init(state, workflow, c).await.map(States::from),
        }
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            States::DataCollection(_) => None,
            States::VendorCalls(_) => Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls)),
            States::Decisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
            States::Complete(_) => None,
        }
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<Self> {
        // TODO could get rid of this with enum_dispatch if actions are not typed
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
        Ok(new_state)
    }
}

// more boiling plates
// would be nice to autogen this
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

impl From<States> for newtypes::WorkflowState {
    fn from(value: States) -> Self {
        let kyc_state = match value {
            States::DataCollection(_) => newtypes::KycState::DataCollection,
            States::VendorCalls(_) => newtypes::KycState::VendorCalls,
            States::Decisioning(_) => newtypes::KycState::Decisioning,
            States::Complete(_) => newtypes::KycState::Complete,
        };
        newtypes::WorkflowState::from(kyc_state)
    }
}
