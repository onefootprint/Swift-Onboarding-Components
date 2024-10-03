use super::fingerprints::Fingerprints;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::CompositeFingerprint;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DataRequest;
use newtypes::Fingerprint;
use newtypes::MissingFingerprint;
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

type CompositeFingerprints = (
    Vec<(CompositeFingerprint, Fingerprint)>,
    HashMap<DataIdentifier, PiiString>,
);

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
        let DataRequest {
            mut data,
            json_fields,
        } = data;

        let request_fingerprints = Self::generate_request_fingerprints(state, &data, t_id).await?;
        let (vault_fingerprints, salt_to_dl_id) =
            Self::generate_vault_fingerprints(state, &vw, &data, t_id).await?;
        let fingerprints = request_fingerprints
            .iter()
            .chain(vault_fingerprints.iter())
            .cloned()
            .collect_vec();

        let fp_salt_to_fp: HashMap<_, _> = fingerprints.iter().cloned().collect();
        let new_dis = data.keys().collect_vec();

        let (composite_fingerprints, addl_dis) =
            Self::generate_composite_fingerprints(&fp_salt_to_fp, &vw.populated_dis(), &new_dis, t_id)?;

        data.extend(addl_dis);
        let request = Self {
            data,
            json_fields,
            fingerprints: Fingerprints::new(fingerprints, composite_fingerprints, salt_to_dl_id),
        };
        Ok(request)
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
        let DataRequest {
            mut data,
            json_fields,
        } = data;
        let new_dis = data.keys().collect_vec();
        let fingerprints = Self::generate_request_fingerprints(state, &data, tenant_id).await?;
        let salt_to_fp: HashMap<_, _> = fingerprints.iter().cloned().collect();

        let (composite_fingerprints, addl_dis) =
            Self::generate_composite_fingerprints(&salt_to_fp, &[], &new_dis, tenant_id)?;

        data.extend(addl_dis);
        let request = Self {
            data,
            json_fields,
            fingerprints: Fingerprints::new(fingerprints, composite_fingerprints, HashMap::new()),
        };
        Ok(request)
    }

    async fn generate_request_fingerprints(
        state: &State,
        data: &HashMap<DataIdentifier, PiiString>,
        tenant_id: &TenantId,
    ) -> FpResult<Vec<(FingerprintSalt, Fingerprint)>> {
        let data_to_fingerprint: Vec<_> = data
            .iter()
            .flat_map(|(di, pii)| di.get_fingerprint_payload(pii, Some(tenant_id)))
            .collect();

        let fingerprints = state
            .enclave_client
            .batch_fingerprint(data_to_fingerprint)
            .await?;

        Ok(fingerprints)
    }

    async fn generate_vault_fingerprints(
        state: &State,
        vault_wrapper: &VaultWrapper,
        data: &HashMap<DataIdentifier, PiiString>,
        tenant_id: &TenantId,
    ) -> FpResult<(
        Vec<(FingerprintSalt, Fingerprint)>,
        HashMap<FingerprintSalt, DataLifetimeId>,
    )> {
        // If we're only updating some of the DIs that makes up a composite fingerprint, generate
        // fingerprints from the existing data in the vault for all other DIs that make up the
        // composite fingerprint
        let new_dis = data.keys().collect_vec();
        let needed_fps = CompositeFingerprint::list(tenant_id, &new_dis)
            .into_iter()
            .filter(|cfp| cfp.should_generate(&vault_wrapper.populated_dis(), &new_dis))
            .flat_map(|cfp| cfp.salts())
            .map(|pfpk| pfpk.di())
            .unique()
            .collect_vec();

        let data_to_fp = needed_fps
            .iter()
            .filter(|di| !new_dis.contains(di))
            .flat_map(|di| vault_wrapper.data(di))
            .filter_map(|d| d.data.vd())
            // Add verified phone number here?
            .flat_map(|d| {
                let fps = d.kind.get_fingerprint_payload(&d.e_data, Some(tenant_id));
                // Attach a Key to each fingerprint payload that includes the lifetime ID and salt
                fps.into_iter().map(|(salt, fp)| ((salt.clone(), d.lifetime_id.clone()), (salt, fp)))
            })
            .collect_vec();

        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&vault_wrapper.vault.e_private_key, data_to_fp)
            .await?;

        let (addl_fingerprints, salt_to_dl_id): (
            Vec<(FingerprintSalt, Fingerprint)>,
            HashMap<FingerprintSalt, DataLifetimeId>,
        ) = fingerprints
            .clone()
            .into_iter()
            .map(|((salt, dl_id), fp)| ((salt.clone(), fp), (salt, dl_id)))
            .unzip();

        Ok((addl_fingerprints, salt_to_dl_id))
    }

    fn generate_composite_fingerprints(
        salt_to_fp: &HashMap<FingerprintSalt, Fingerprint>,
        existing_dis: &[DataIdentifier],
        new_dis: &[&DataIdentifier],
        tenant_id: &TenantId,
    ) -> FpResult<CompositeFingerprints> {
        //
        // Create composite fingerprints out of pre-computed transient fingerprints
        //
        let composite_fingerprints = CompositeFingerprint::list(tenant_id, new_dis)
            .into_iter()
            .filter(|cfp| cfp.should_generate(existing_dis, new_dis))
            .map(|cfp| -> FpResult<_> {
                // For each Composite FPK that has any DI represented in this data update, generate
                // the new composite fingerprint out of the pre-computed transient fingerprints
                let sh_data = match cfp.compute(salt_to_fp) {
                    Ok(sh_data) => sh_data,
                    Err(MissingFingerprint(salt)) => {
                        tracing::error!(
                            ?salt,
                            "Failed to compute composite fingerprint. Missing fingerprint"
                        );
                        return Ok(None);
                    }
                };

                Ok(Some((cfp, sh_data)))
            })
            .collect::<FpResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .collect_vec();

        //
        // Add additional DI's for all composite fingerprints that should be tokenized.
        //
        let addl_dis: HashMap<DataIdentifier, PiiString> = composite_fingerprints
            .clone()
            .into_iter()
            .filter_map(|(cfp, fp)| cfp.to_token_di().map(|di| (di, fp.to_token())))
            .collect();

        Ok((composite_fingerprints, addl_dis))
    }

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying
    /// data
    pub fn manual_fingerprints(data: DataRequest, fingerprints: Vec<(FingerprintSalt, Fingerprint)>) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints: Fingerprints::new(fingerprints, vec![], HashMap::new()),
        }
    }

    /// Backdoor to not attach fingerprints to the DataRequest for cases where we're just using the
    /// DataRequest for validation
    pub fn no_fingerprints_for_validation(data: DataRequest) -> Self {
        Self {
            data: data.data,
            json_fields: data.json_fields,
            fingerprints: Fingerprints::new(vec![], vec![], HashMap::new()),
        }
    }
}
