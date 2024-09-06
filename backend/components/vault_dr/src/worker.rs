use crate::VaultDrWriter;
use api_core::FpResult;
use api_core::State;
use db::models::vault_dr::VaultDrConfig;
use newtypes::VaultDrConfigId;

#[derive(Debug, Clone, Copy)]
pub struct Knobs {
    pub batch_size: u32,
    pub record_task_concurrency: usize,
}

impl Default for Knobs {
    fn default() -> Self {
        Self {
            batch_size: 1000,
            record_task_concurrency: 64,
        }
    }
}

// For each enrolled tenant, encrypt and write up to `batch_size` records to Vault DR buckets.
// Errors returned from this function cause the worker to shut down.
pub async fn run_batch(state: &State, knobs: Knobs) -> FpResult<()> {
    let configs = state.db_pool.db_query(VaultDrConfig::list).await?;

    for config in configs {
        let VaultDrConfig {
            id: config_id,
            tenant_id,
            is_live,
            ..
        } = config;

        tracing::info!(
            %config_id,
            %tenant_id,
            is_live,
            ?knobs,
            "Starting batch for config"
        );
        let result = run_batch_for_config(state, knobs, &config_id).await;
        match result {
            Ok(_) => {
                tracing::info!(
                    %config_id,
                    %tenant_id,
                    is_live,
                    ?knobs,
                    "Batch completed for config"
                );
            }
            Err(error) => {
                tracing::error!(
                    %config_id,
                    %tenant_id,
                    is_live,
                    ?knobs,
                    ?error,
                    "Batch failed for config"
                );
            }
        }
    }

    Ok(())
}


async fn run_batch_for_config(state: &State, knobs: Knobs, config_id: &VaultDrConfigId) -> FpResult<()> {
    let vdr_writer = VaultDrWriter::new(state, config_id, knobs).await?;

    vdr_writer.write_blobs_batch(state, None).await?;

    Ok(())
}
