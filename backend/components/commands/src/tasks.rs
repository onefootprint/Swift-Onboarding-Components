use anyhow::{anyhow, Result};
use api_core::{config::Config, task, State};
use clap::Parser;
use tokio::{
    select, signal,
    time::{self, Duration},
};

use tracing::info;

// Test by running:
//   cargo run -p api_server -- execute-tasks --batch-size 100 --poll-period-ms 1000
// and then running:
//   curl localhost:8000/private/protected/task/create_task -X POST -d '{"task_data": {"kind": "log_message", "data": {"message": "hi!"}}}' -H 'X-Fp-Protected-Custodian-Key: $PROTECTED_CUSTODIAN_KEY'

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


        let mut interval = time::interval(poll_period);
        // If there's a batch that takes longer than the poll_period, the max task throughput will
        // not burst following that slow batch.
        interval.set_missed_tick_behavior(time::MissedTickBehavior::Delay);

        loop {
            select! {
                _ = interval.tick() => {
                    self.run_batch(&state).await?;
                }
                _ = signal::ctrl_c() => {
                    info!("shutting down worker");
                    break;
                }
            }
        }

        Ok(())
    }

    #[tracing::instrument("ExecuteTasks::run_batch", skip_all)]
    async fn run_batch(&self, state: &State) -> Result<()> {
        let num_completed = task::poll_and_execute_tasks(state, self.batch_size, None)
            .await
            .map_err(|e| anyhow!("{}", e))?
            .len();

        info!(num_completed, "completed batch");

        Ok(())
    }
}
