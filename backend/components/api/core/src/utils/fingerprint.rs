use std::collections::HashMap;

use futures::TryFutureExt;
use newtypes::{DataIdentifier, DataRequest, Fingerprint, Fingerprinter, IdentityDataKind as IDK};

use crate::{errors::ApiResult, State};

pub type NewFingerprints<T> = HashMap<T, Fingerprint>;

/// Computes the fingerprints for a provided DataRequest
/// TODO: move this closer to parsing of DataRequest
#[tracing::instrument(skip_all)]
pub async fn build_fingerprints(state: &State, update: DataRequest) -> ApiResult<NewFingerprints<IDK>> {
    let fut_fingerprints = update
        .into_inner()
        .into_iter()
        .filter_map(|(di, pii)| match di {
            // Only fingerprint ID data for now
            DataIdentifier::Id(idk) => Some((idk, pii)),
            _ => None,
        })
        .map(|(idk, pii)| {
            let pii = pii.clean_for_fingerprint();
            state
                .compute_fingerprint(idk, pii)
                .map_ok(move |sh_data| (idk, sh_data))
        });
    let fingerprints = futures::future::try_join_all(fut_fingerprints)
        .await?
        .into_iter()
        .collect();
    Ok(fingerprints)
}
