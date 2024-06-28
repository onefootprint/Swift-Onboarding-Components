use crate::Error;
use api_core::State;

// Encrypt and write up to `batch_size` records to Vault DR buckets.
// Errors returned from this function cause the worker to shut down.
pub async fn run_batch(_state: &State, _batch_size: u32) -> Result<(), Error> {
    Ok(())
}
