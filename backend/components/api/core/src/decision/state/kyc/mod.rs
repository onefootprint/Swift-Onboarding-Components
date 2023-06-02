pub mod states;
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use super::{
    actions::{MakeDecision, MakeVendorCalls},
    DoAction, OnAction, StateError, WorkflowActions, WorkflowWrapperState,
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
pub enum KycState {
    DataCollection(DataCollection),
    VendorCalls(VendorCalls),
    Decisioning(Decisioning),
    Complete(Complete),
}

impl KycState {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let newtypes::WorkflowState::Kyc(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        };
        let newtypes::WorkflowConfig::Kyc(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into())
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::KycState::DataCollection => {
                DataCollection::init(state, workflow, c).await.map(KycState::from)
            }
            newtypes::KycState::VendorCalls => {
                VendorCalls::init(state, workflow, c).await.map(KycState::from)
            }
            newtypes::KycState::Decisioning => {
                Decisioning::init(state, workflow, c).await.map(KycState::from)
            }
            newtypes::KycState::Complete => Complete::init(state, workflow, c).await.map(KycState::from),
        }
    }
}

#[async_trait]
impl super::WorkflowState for KycState {
    fn default_action(&self) -> Option<WorkflowActions> {
        match self {
            KycState::DataCollection(_) => None,
            KycState::VendorCalls(_) => Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls)),
            KycState::Decisioning(_) => Some(WorkflowActions::MakeDecision(MakeDecision)),
            KycState::Complete(_) => None,
        }
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> ApiResult<WorkflowWrapperState> {
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
        Ok(new_state.into())
    }
}

// more boiling plates
// would be nice to autogen this
impl From<DataCollection> for KycState {
    fn from(value: DataCollection) -> Self {
        KycState::DataCollection(value)
    }
}

impl From<VendorCalls> for KycState {
    fn from(value: VendorCalls) -> Self {
        KycState::VendorCalls(value)
    }
}

impl From<Decisioning> for KycState {
    fn from(value: Decisioning) -> Self {
        KycState::Decisioning(value)
    }
}

impl From<Complete> for KycState {
    fn from(value: Complete) -> Self {
        KycState::Complete(value)
    }
}

impl From<KycState> for newtypes::WorkflowState {
    fn from(value: KycState) -> Self {
        let kyc_state = match value {
            KycState::DataCollection(_) => newtypes::KycState::DataCollection,
            KycState::VendorCalls(_) => newtypes::KycState::VendorCalls,
            KycState::Decisioning(_) => newtypes::KycState::Decisioning,
            KycState::Complete(_) => newtypes::KycState::Complete,
        };
        newtypes::WorkflowState::from(kyc_state)
    }
}
