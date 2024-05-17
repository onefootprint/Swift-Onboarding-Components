use newtypes::{
    fingerprint_salt::FingerprintSalt, DataIdentifier, DataRequest, Fingerprint, PiiString, ScopedVaultId,
    TenantId,
};
use std::{clone::Clone, collections::HashMap};

use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper},
    State,
};

use super::fingerprints::Fingerprints;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct FingerprintedDataRequest {
    #[deref]
    #[deref_mut]
    pub data: HashMap<DataIdentifier, PiiString>,
    pub(super) json_fields: Vec<DataIdentifier>,
    pub(super) fingerprints: Fingerprints,
}


impl FingerprintedDataRequest {
    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new DataRequest with the Fingerprints populated.
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a vault
    #[tracing::instrument("FingerprintedDataRequest::build", skip_all)]
    pub async fn build(state: &State, data: DataRequest, sv_id: &ScopedVaultId) -> ApiResult<Self> {
        let sv_id = sv_id.clone();
        let vw = state
            .db_pool
            .db_query(move |conn| VaultWrapper::<Any>::build_for_tenant(conn, &sv_id))
            .await?;
        let t_id = &vw.scoped_vault.tenant_id;
        let res = Self::build_for_new_user(state, data, t_id).await?;
        // TODO one day get missing fingerprints from the data in the vault if it's not in this request
        // TODO should we also check that the data we use to make partial fingerprints doesn't change
        // before we make the composite fingerprint?
        // otherwise, we could still have stale composite fingerprints...
        Ok(res)
    }

    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new FingerprintedDataRequest.
    /// This method should _only_ be used when creating a new user, as it won't generate any
    /// partial fingerprints for existing data that are needed to create compsite fingerprints.
    #[tracing::instrument("FingerprintedDataRequest::build_for_new_user", skip_all)]
    pub async fn build_for_new_user(
        state: &State,
        data: DataRequest,
        tenant_id: &TenantId,
    ) -> ApiResult<Self> {
        let DataRequest { data, json_fields } = data;

        let data_to_fingerprint: Vec<_> = data
            .iter()
            .flat_map(|(di, pii)| di.get_fingerprint_payload(pii, Some(tenant_id)))
            .collect();

        let fingerprints = state
            .enclave_client
            .batch_fingerprint(data_to_fingerprint)
            .await?;

        let request = Self {
            data,
            json_fields,
            fingerprints: Fingerprints::new(fingerprints),
        };
        Ok(request)
    }

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying data
    pub fn manual_fingerprints(data: DataRequest, fingerprints: Vec<(FingerprintSalt, Fingerprint)>) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints: Fingerprints::new(fingerprints),
        }
    }

    /// Backdoor to not attach fingerprints to the DataRequest for cases where we're just using the
    /// DataRequest for validation
    pub fn no_fingerprints_for_validation(data: DataRequest) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints: Fingerprints::new(vec![]),
        }
    }
}
