use super::fingerprints::Fingerprints;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::CompositeFingerprint;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::Fingerprint;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use std::clone::Clone;
use std::collections::HashMap;

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
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a
    /// vault
    #[tracing::instrument("FingerprintedDataRequest::build", skip_all)]
    pub async fn build(state: &State, data: DataRequest, sv_id: &ScopedVaultId) -> FpResult<Self> {
        let sv_id = sv_id.clone();
        let vw = state
            .db_pool
            .db_query(move |conn| VaultWrapper::<Any>::build_for_tenant(conn, &sv_id))
            .await?;
        let t_id = &vw.scoped_vault.tenant_id;
        let mut res = Self::build_for_new_user(state, data, t_id).await?;

        // If we're only updating some of the DIs that makes up a composite fingerprint, generate
        // fingerprints from the existing data in the vault for all other DIs that make up the
        // composite fingerprint
        let new_dis = res.data.keys().collect_vec();
        let needed_fps = CompositeFingerprint::list(t_id, &new_dis)
            .into_iter()
            .filter(|cfp| cfp.should_generate(&vw.populated_dis(), &new_dis))
            .flat_map(|cfp| cfp.salts())
            .map(|pfpk| pfpk.di())
            .unique()
            .collect_vec();

        let missing_fps = needed_fps.iter().filter(|di| !new_dis.contains(di)).collect_vec();
        let (addl_fingerprints, salt_to_dl_id) = vw.fingerprint_ciphertext(state, missing_fps, t_id).await?;
        res.fingerprints.extend(addl_fingerprints, salt_to_dl_id);
        Ok(res)
    }

    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new FingerprintedDataRequest.
    /// This method should _only_ be used when creating a new user, as it won't generate any
    /// transient fingerprints for existing data that are needed to create compsite fingerprints.
    #[tracing::instrument("FingerprintedDataRequest::build_for_new_user", skip_all)]
    pub async fn build_for_new_user(
        state: &State,
        data: DataRequest,
        tenant_id: &TenantId,
    ) -> FpResult<Self> {
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

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying
    /// data
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
