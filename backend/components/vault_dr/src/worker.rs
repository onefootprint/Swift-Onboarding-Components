use crate::VaultDrWriter;
use api_core::FpResult;
use api_core::State;
use db::models::vault_dr::VaultDrConfig;
use newtypes::VaultDrConfigId;

// For each enrolled tenant, encrypt and write up to `batch_size` records to Vault DR buckets.
// Errors returned from this function cause the worker to shut down.
pub async fn run_batch(state: &State, batch_size: u32) -> FpResult<()> {
    let configs = state.db_pool.db_query(VaultDrConfig::list).await?;

    for config in configs {
        let VaultDrConfig {
            id: config_id,
            tenant_id,
            is_live,
            ..
        } = config;

        tracing::info!(
            ?config_id,
            ?tenant_id,
            is_live,
            batch_size,
            "Starting batch for config"
        );
        let result = run_batch_for_config(state, batch_size, &config_id).await;
        match result {
            Ok(_) => {
                tracing::info!(
                    ?config_id,
                    ?tenant_id,
                    is_live,
                    batch_size,
                    "Batch completed for config"
                );
            }
            Err(error) => {
                tracing::error!(
                    ?config_id,
                    ?tenant_id,
                    is_live,
                    batch_size,
                    ?error,
                    "Batch failed for config"
                );
            }
        }
    }

    Ok(())
}


async fn run_batch_for_config(state: &State, batch_size: u32, config_id: &VaultDrConfigId) -> FpResult<()> {
    let vdr_writer = VaultDrWriter::new(state, config_id).await?;

    vdr_writer.write_blobs_batch(state, batch_size).await?;

    Ok(())
}
