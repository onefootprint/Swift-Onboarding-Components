use super::actions::MakeDecision;
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
use newtypes::WorkflowId;
pub use states::*;

#[derive(Clone)]
#[enum_dispatch(WorkflowState)]
pub enum DocumentState {
    DataCollection(DocumentDataCollection),
    Decisioning(DocumentDecisioning),
    Complete(DocumentComplete),
}

impl DocumentState {
    pub async fn init(state: &State, workflow: DbWorkflow) -> FpResult<Self> {
        let newtypes::WorkflowState::Document(s) = workflow.state else {
            return Err(StateError::UnexpectedStateForWorkflow(workflow.state, workflow.id).into());
        };
        let newtypes::WorkflowConfig::Document(c) = workflow.config.clone() else {
            return Err(StateError::UnexpectedConfigForWorkflow(workflow.config, workflow.id).into());
        };
        // TODO could get rid of this with enum_dispatch
        match s {
            newtypes::DocumentState::DataCollection => DocumentDataCollection::init(state, workflow, c)
                .await
                .map(DocumentState::from),
            newtypes::DocumentState::Decisioning => DocumentDecisioning::init(state, workflow, c)
                .await
                .map(DocumentState::from),
            newtypes::DocumentState::Complete => DocumentComplete::init(state, workflow, c)
                .await
                .map(DocumentState::from),
        }
    }
}

#[async_trait]
impl Workflow for DocumentState {
    fn default_action(&self) -> Option<WorkflowActions> {
        <Self as WorkflowState>::default_action(self)
    }

    async fn action(
        self,
        state: &State,
        action: WorkflowActions,
        workflow_id: WorkflowId,
    ) -> FpResult<WorkflowKind> {
        let new_state = match (self, action) {
            (Self::DataCollection(s), WorkflowActions::DocCollected(a)) => {
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
