use crate::decision::state::RunIncodeMachineAndWorkflowResult;
use crate::decision::state::WorkflowWrapper;
use crate::decision::{
    self,
};
use crate::task::ExecuteTask;
use crate::task::TaskError;
use crate::ApiCoreError;
use crate::State;
use api_errors::FpError;
use async_trait::async_trait;
use db::models::workflow::Workflow;
use newtypes::RunIncodeStuckWorkflowArgs;

pub(crate) struct RunIncodeStuckWorkflowTask {
    state: State,
}

impl RunIncodeStuckWorkflowTask {
    #[allow(unused)]
    pub fn new(state: State) -> Self {
        Self { state }
    }
}

#[async_trait]
impl ExecuteTask<RunIncodeStuckWorkflowArgs> for RunIncodeStuckWorkflowTask {
    async fn execute(&self, args: &RunIncodeStuckWorkflowArgs) -> Result<(), TaskError> {
        let wfid = args.workflow_id.clone();
        let wf = self
            .state
            .db_pool
            .db_query(move |conn| Workflow::get(conn, &wfid))
            .await?;
        let ww = WorkflowWrapper::init(&self.state, wf).await?;
        let run = decision::state::run_incode_machine_and_workflow(&self.state, ww).await?;
        match run {
            RunIncodeMachineAndWorkflowResult::IncodeStuck => {
                Err(FpError::from(ApiCoreError::AssertionError("IncodeStuck".to_owned())).into())
            }
            RunIncodeMachineAndWorkflowResult::WorkflowRan => Ok(()),
        }
    }
}
