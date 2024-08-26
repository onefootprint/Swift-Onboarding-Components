use crate::decision::state::RunIncodeMachineAndWorkflowResult;
use crate::decision::state::WorkflowWrapper;
use crate::decision::{
    self,
};
use crate::task::ExecuteTask;
use crate::State;
use api_errors::AssertionError;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::data_lifetime::DataLifetime;
use db::models::workflow::Workflow;
use db::DbResult;
use newtypes::RunIncodeStuckWorkflowArgs;

#[derive(derive_more::Constructor)]
pub(crate) struct RunIncodeStuckWorkflowTask {
    state: State,
}

#[async_trait]
impl ExecuteTask<RunIncodeStuckWorkflowArgs> for RunIncodeStuckWorkflowTask {
    async fn execute(self, args: RunIncodeStuckWorkflowArgs) -> FpResult<()> {
        let Self { state } = self;
        let RunIncodeStuckWorkflowArgs { workflow_id: wfid } = args;
        let (wf, seqno) = state
            .db_pool
            .db_query(move |conn| -> DbResult<_> {
                let wf = Workflow::get(conn, &wfid)?;
                let seqno = DataLifetime::get_current_seqno(conn)?;
                Ok((wf, seqno))
            })
            .await?;
        let ww = WorkflowWrapper::init(&state, wf, seqno).await?;
        let run = decision::state::run_incode_machine_and_workflow(&state, ww).await?;
        match run {
            RunIncodeMachineAndWorkflowResult::IncodeStuck => {
                return AssertionError("IncodeStuck").into();
            }
            RunIncodeMachineAndWorkflowResult::WorkflowRan => Ok(()),
        }
    }
}
