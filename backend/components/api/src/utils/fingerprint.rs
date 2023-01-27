use futures::TryFutureExt;
use newtypes::{Fingerprint, Fingerprinter, IdentityDataKind, IdentityDataUpdate};

use crate::{errors::ApiResult, State};

/// Computes the fingerprints for a provided IdentityDataUpdate
pub async fn build_fingerprints(
    state: &State,
    update: IdentityDataUpdate,
) -> ApiResult<Vec<(IdentityDataKind, Fingerprint)>> {
    let fut_fingerprints = update.into_inner().into_iter().map(|(kind, pii)| {
        let pii = pii.clean_for_fingerprint();
        state
            .compute_fingerprint(kind, pii)
            .map_ok(move |sh_data| (kind, sh_data))
    });
    let fingerprints = futures::future::try_join_all(fut_fingerprints).await?;
    Ok(fingerprints)
}
