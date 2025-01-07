use anyhow::anyhow;
use anyhow::Result;
use api_core::config::Config;
use api_core::task;
use api_core::State;
use clap::Parser;
use db::models::task::TaskPollArgs;
use tokio::select;
use tokio::signal;
use tokio::time::Duration;
use tokio::time::{
    self,
};
use tracing::error;
use tracing::info;

// Test by running:
//   cargo run -p api_server -- execute-tasks --batch-size 100 --poll-period-ms 1000
// and then running:
//   curl localhost:8000/private/protected/task/create_task -X POST -d '{"task_data": {"kind":
// "log_message", "data": {"message": "hi!"}}}' -H 'X-Fp-Protected-Custodian-Key:
// $PROTECTED_CUSTODIAN_KEY'

#[derive(Parser, Debug)]
pub struct ExecuteTasks {
    #[arg(long)]
    pub batch_size: u32,

    #[arg(long)]
    pub poll_period_ms: u64,
}

impl ExecuteTasks {
    pub async fn run(self, _config: Config, state: State) -> Result<()> {
        let poll_period = Duration::from_millis(self.poll_period_ms);
        info!(
            batch_size = self.batch_size,
            ?poll_period,
            "starting execute-tasks worker...",
        );

        let (shutdown_send, mut shutdown_recv) = tokio::sync::mpsc::channel(1);
        tokio::spawn(async move {
            match signal::ctrl_c().await {
                Ok(_) => {
                    info!("received shutdown signal, will shut down after the current batch is complete...");
                    if let Err(err) = shutdown_send.send(()).await {
                        error!(?err, "failed to send to shutdown channel");
                    }
                }
                Err(err) => {
                    error!(?err, "failed to receive shutdown signal");
                }
            }
        });

        let mut interval = time::interval(poll_period);
        // If there's a batch that takes longer than the poll_period, the max task throughput will
        // not burst following that slow batch.
        interval.set_missed_tick_behavior(time::MissedTickBehavior::Delay);

        loop {
            select! {
                // Shutdown on the next poll if a ctrl-c signal has been received.
                // This is subject to the ECS stopTimeout before the task is forcefullly killed.
                biased;
                _ = shutdown_recv.recv() => {
                    info!("shutting down worker");
                    break;
                }
                _ = interval.tick() => {
                    self.run_batch(&state).await?;
                }
            }
        }

        Ok(())
    }

    #[tracing::instrument("ExecuteTasks::run_batch", skip_all)]
    async fn run_batch(&self, state: &State) -> Result<()> {
        let args = TaskPollArgs::Limit {
            limit: self.batch_size,
        };
        let num_completed = task::poll_and_execute_tasks(state, args)
            .await
            .map_err(|e| anyhow!("{}", e))?
            .len();

        info!(num_completed, "completed batch");

        Ok(())
    }
}
