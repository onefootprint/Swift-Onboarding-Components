use std::collections::HashMap;

use futures::TryFutureExt;
use newtypes::{DataRequest, Fingerprint, Fingerprinter, IdentityDataKind};

use crate::{errors::ApiResult, State};

pub type NewFingerprints = HashMap<IdentityDataKind, Fingerprint>;

/// Computes the fingerprints for a provided IdentityDataUpdate
#[tracing::instrument(skip_all)]
pub async fn build_fingerprints(
    state: &State,
    update: DataRequest<IdentityDataKind>,
) -> ApiResult<NewFingerprints> {
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
