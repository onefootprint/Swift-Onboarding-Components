use std::collections::HashMap;

use futures::TryFutureExt;
use newtypes::{DataRequest, Fingerprint, Fingerprinter, SaltedFingerprint};

use crate::{errors::ApiResult, State};

pub type NewFingerprints<T> = HashMap<T, Fingerprint>;

/// Computes the fingerprints for a provided DataRequest<T>
#[tracing::instrument(skip_all)]
pub async fn build_fingerprints<T>(state: &State, update: DataRequest<T>) -> ApiResult<NewFingerprints<T>>
where
    T: SaltedFingerprint + Send + std::hash::Hash + std::cmp::Eq + Copy,
{
    let fut_fingerprints = update.into_inner().into_iter().map(|(kind, pii)| {
        let pii = pii.clean_for_fingerprint();
        state
            .compute_fingerprint(kind, pii)
            .map_ok(move |sh_data| (kind, sh_data))
    });
    let fingerprints = futures::future::try_join_all(fut_fingerprints)
        .await?
        .into_iter()
        .collect();
    Ok(fingerprints)
}
