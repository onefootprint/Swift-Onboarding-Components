use anyhow::anyhow;
use anyhow::Result;
use api_core::config::Config;
use api_core::State;
use clap::Parser;
use tokio::select;
use tokio::signal;
use tokio::time::Duration;
use tokio::time::{
    self,
};
use tracing::error;
use tracing::info;
use vault_dr::Knobs;


#[derive(Parser, Debug)]
pub struct VaultDrWorker {
    #[arg(long)]
    pub poll_period_ms: u64,

    #[arg(long)]
    pub blob_batch_size: u32,

    #[arg(long)]
    pub manifest_batch_size: u32,

    #[arg(long)]
    pub record_task_concurrency: usize,

    #[arg(long)]
    pub manifest_task_concurrency: usize,
}

impl VaultDrWorker {
    pub async fn run(self, _config: Config, state: State) -> Result<()> {
        let poll_period = Duration::from_millis(self.poll_period_ms);
        info!(
            config = ?self,
            "starting vault-dr worker...",
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

    fn knobs(&self) -> Knobs {
        Knobs {
            manifest_batch_size: self.manifest_batch_size,
            blob_batch_size: self.blob_batch_size,
            record_task_concurrency: self.record_task_concurrency,
            manifest_task_concurrency: self.manifest_task_concurrency,
            skip_client_validation: false,
        }
    }

    #[tracing::instrument("VaultDrWorker::run_batch", skip_all)]
    async fn run_batch(&self, state: &State) -> Result<()> {
        vault_dr::run_batch(state, self.knobs())
            .await
            .map_err(|err| anyhow!("{}", err).context("VaultDrWorker::run_batch"))?;

        Ok(())
    }
}
