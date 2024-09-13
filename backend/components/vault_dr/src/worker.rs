use crate::VaultDrWriter;
use api_core::FpResult;
use api_core::State;
use db::models::vault_dr::VaultDrConfig;
use newtypes::VaultDrConfigId;

#[derive(Debug, Clone, Copy)]
pub struct Knobs {
    // The number of new manifests/scoped vault versions is <= the number of new blobs, since
    // there can be at most one manifest per blob already written to the DB. Therefore, under
    // ideal conditions, equal batch sizes would allow for the writer to stay up to date on
    // writing manifests. However, since writing manifests may fail after successfully writing
    // blobs, the queue of manifests to write may grow larger than the blob batch size. So to
    // allow the writer to catch up a modest backlog of manifests without intervention, we use
    // a greater batch size limit for manifests.
    //
    // We allow for independent control of these batch sizes to facilitate backfills.
    pub blob_batch_size: u32,
    pub manifest_batch_size: u32,

    pub record_task_concurrency: usize,
    pub manifest_task_concurrency: usize,
}

impl Default for Knobs {
    fn default() -> Self {
        Self {
            blob_batch_size: 1000,
            manifest_batch_size: 1500,
            record_task_concurrency: 64,
            manifest_task_concurrency: 64,
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


#[tracing::instrument("vault_dr::run_batch_for_config", skip_all)]
async fn run_batch_for_config(state: &State, knobs: Knobs, config_id: &VaultDrConfigId) -> FpResult<()> {
    let vdr_writer = VaultDrWriter::new(state, config_id, knobs).await?;

    vdr_writer.write_batch(state, None).await?;

    Ok(())
}
