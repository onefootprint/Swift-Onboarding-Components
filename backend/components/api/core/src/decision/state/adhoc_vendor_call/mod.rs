use super::DoAction;
use super::StateError;
use super::Workflow;
use super::WorkflowActions;
use super::WorkflowKind;
use super::WorkflowState;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use enum_dispatch::enum_dispatch;

mod states;
use newtypes::AdhocVendorCallState as NTAdhocVendorCallState;
use newtypes::DataLifetimeSeqno;
use newtypes::WorkflowId;
pub use states::*;


#[derive(Clone)]
#[enum_dispatch(WorkflowState)]
pub enum AdhocVendorCallState {
    VendorCalls(AdhocVendorCallVendorCalls),
    Complete(AdhocVendorCallComplete),
}

impl AdhocVendorCallState {
    pub async fn init(state: &State, workflow: DbWorkflow, seqno: DataLifetimeSeqno) -> FpResult<Self> {
        let newtypes::WorkflowConfig::AdhocVendorCall(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into());
        };
        if let newtypes::WorkflowState::AdhocVendorCall(s) = workflow.state {
            match s {
                NTAdhocVendorCallState::VendorCalls => {
                    AdhocVendorCallVendorCalls::init(state, workflow, c, seqno)
                        .await
                        .map(AdhocVendorCallState::from)
                }
                NTAdhocVendorCallState::Complete => {
                    AdhocVendorCallComplete::init(state, workflow, c).map(AdhocVendorCallState::from)
                }
            }
        } else {
            Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into())
        }
    }
}

#[async_trait]
impl Workflow for AdhocVendorCallState {
    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        <Self as WorkflowState>::default_action(self, seqno)
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> FpResult<WorkflowKind> {
        let new_state = match (self, action) {
            (Self::VendorCalls(s), WorkflowActions::MakeVendorCalls(a)) => {
                s.do_action(state, a, workflow_id).await?
            }
            (_, _) => return Err(StateError::UnexpectedActionForState.into()),
        };
        Ok(new_state.into())
    }
}
