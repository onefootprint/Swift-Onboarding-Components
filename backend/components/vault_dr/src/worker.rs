use crate::get_backup_status;
use crate::BackupStatus;
use crate::BatchResult;
use crate::VaultDrWriter;
use api_core::FpResult;
use api_core::State;
use db::models::vault_dr::VaultDrConfig;
use newtypes::VaultDrConfigId;

#[derive(Debug, Clone, Copy)]
pub struct Knobs {
    /// The maximum number of manifests to attempt to write in a single batch.
    /// The number of manifests actually written is constrained by whether associated blobs have
    /// all been written.
    pub manifest_batch_size: u32,
    /// The maximum number of blobs to write in a single batch. The number of blobs actually
    /// selected for writing is determined by the number of manifests chosen for the batch and how
    /// many associated blobs have not been written.
    pub blob_batch_size: u32,

    pub record_task_concurrency: usize,
    pub manifest_task_concurrency: usize,
}

impl Default for Knobs {
    fn default() -> Self {
        Self {
            manifest_batch_size: 1024,
            blob_batch_size: 2048,
            record_task_concurrency: 64,
            manifest_task_concurrency: 64,
        }
    }
}

// For each enrolled tenant, encrypt and write records to Vault DR buckets.
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
            Ok((batch_result, backup_status)) => {
                let BatchResult {
                    num_blobs,
                    num_manifests,
                } = batch_result;

                let BackupStatus {
                    latest_backup_record_timestamp,
                    lag_seconds,
                } = backup_status;

                tracing::info!(
                    %config_id,
                    %tenant_id,
                    is_live,
                    ?knobs,
                    num_blobs,
                    num_manifests,
                    ?latest_backup_record_timestamp,
                    lag_seconds,
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


#[tracing::instrument("vault_dr::run_batch_for_config", skip_all, fields(config_id = %config_id))]
async fn run_batch_for_config(
    state: &State,
    knobs: Knobs,
    config_id: &VaultDrConfigId,
) -> FpResult<(BatchResult, BackupStatus)> {
    let vdr_writer = VaultDrWriter::new(state, config_id, knobs).await?;
    let result = vdr_writer.run_batch(state, None).await?;

    let status = get_backup_status(state, config_id).await?;

    Ok((result, status))
}
