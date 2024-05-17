use newtypes::{
    fingerprinter::FingerprintScope, DataIdentifier, DataRequest, Fingerprint, Fingerprinter, PiiString,
    TenantId,
};
use std::{clone::Clone, collections::HashMap};

use crate::{errors::ApiResult, State};

pub type Fingerprints = Vec<(FingerprintScope, Fingerprint)>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct FingerprintedDataRequest {
    #[deref]
    #[deref_mut]
    pub data: HashMap<DataIdentifier, PiiString>,
    json_fields: Vec<DataIdentifier>,
    fingerprints: Fingerprints,
}


impl FingerprintedDataRequest {
    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new DataRequest with the Fingerprints populated.
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a vault
    pub async fn build(state: &State, data: DataRequest, tenant_id: &TenantId) -> ApiResult<Self> {
        let DataRequest { data, json_fields } = data;

        // TODO one day get missing fingerprints from the data in the vault if it's not in this request
        // TODO should we also check that the data we use to make partial fingerprints doesn't change
        // before we make the composite fingerprint?
        // otherwise, we could still have stale composite fingerprints...

        let data_to_fingerprint: Vec<_> = data
            .iter()
            .flat_map(|(di, pii)| di.get_fingerprint_payload(pii, Some(tenant_id)))
            .collect();

        let fingerprints = state
            .enclave_client
            .compute_fingerprints(data_to_fingerprint)
            .await?;

        let request = Self {
            data,
            json_fields,
            fingerprints,
        };
        Ok(request)
    }

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying data
    pub fn manual_fingerprints(data: DataRequest, fingerprints: Fingerprints) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints,
        }
    }

    /// Backdoor to not attach fingerprints to the DataRequest for cases where we're just using the
    /// DataRequest for validation
    pub fn no_fingerprints_for_validation(data: DataRequest) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints: vec![],
        }
    }

    pub fn decompose(
        self,
    ) -> (
        HashMap<DataIdentifier, PiiString>,
        Vec<DataIdentifier>,
        Fingerprints,
    ) {
        (self.data, self.json_fields, self.fingerprints)
    }
}
