use crate::task::ExecuteTask;
use api_errors::FpResult;
use async_trait::async_trait;
use newtypes::LogMessageTaskArgs;

pub(crate) struct LogMessageTask;

#[async_trait]
impl ExecuteTask<LogMessageTaskArgs> for LogMessageTask {
    async fn execute(self, args: LogMessageTaskArgs) -> FpResult<()> {
        let log = format!("LogMessage, message: {}", args.message);
        tracing::info!(log);
        println!("{}", log);
        Ok(())
    }
}
