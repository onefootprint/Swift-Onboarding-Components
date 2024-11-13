use crate::decision::state::RunIncodeMachineAndWorkflowResult;
use crate::decision::state::WorkflowWrapper;
use crate::decision::{
    self,
};
use crate::task::ExecuteTask;
use crate::State;
use api_errors::FpResult;
use api_errors::ServerErrInto;
use async_trait::async_trait;
use db::models::data_lifetime::DataLifetime;
use db::models::workflow::Workflow;
use db::DbResult;
use newtypes::RunIncodeStuckWorkflowArgs;
use std::time::Duration;
use tokio::time::Instant;

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
            .db_query(move |conn| -> DbResult<_> {
                let wf = Workflow::get(conn, &wfid)?;
                let seqno = DataLifetime::get_current_seqno(conn)?;
                Ok((wf, seqno))
            })
            .await?;
        let ww = WorkflowWrapper::init(&state, wf, seqno).await?;
        let deadline = Instant::now() + Duration::from_secs(60);
        let run = decision::state::run_incode_machine_and_workflow(&state, ww, deadline).await?;
        match run {
            RunIncodeMachineAndWorkflowResult::IncodeStuck => {
                return ServerErrInto("IncodeStuck");
            }
            RunIncodeMachineAndWorkflowResult::WorkflowTimedOut => {
                return ServerErrInto("WorkflowTimedOut");
            }
            RunIncodeMachineAndWorkflowResult::WorkflowRan => Ok(()),
        }
    }
}
