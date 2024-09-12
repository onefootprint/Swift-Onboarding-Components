use super::super::PatchDataResult;
use super::Fingerprints;
use super::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::PieceOfData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_data::NewVaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::output::Csv;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSource;
use newtypes::Fingerprint;
use newtypes::TenantId;
use newtypes::VaultKind;
use std::collections::HashMap;
use std::marker::PhantomData;

/// Precomputed portable data from the user-scoped vault that we will use to prefill data for a new
/// tenant.
/// NOTE: it is possible that the portable data is stale by the time we use the PrefillData
/// result to save data to the destination SV, so we may have old or missing portable data.
/// This is necessary since we must asynchronously compute the fingerprints before locking the
/// vault
pub struct PrefillData {
    pub data: Vec<NewVaultData>,
    pub(in super::super) fingerprints: Fingerprints,
    pub(in super::super) old_ci: HashMap<DataIdentifier, ContactInfo>,
    /// Prevent external construction
    phantom: PhantomData<()>,
}

/// Prefill happens in two steps: first, when the ScopedVault is created in POST /hosted/identify,
/// we prefill auth methods into the newly created ScopedVault. Second, when onboarding begins, we
/// prefill other KYC data that's used by the playbook.
pub enum PrefillKind<'a> {
    /// After the identify flow, prefill login methods
    LoginMethods,
    /// When starting onboarding, prefill all data required by the playbook. We shouldn't do this
    /// before creating the Workflow in the database, otherwise we'll unintentionally give decrypt
    /// access to all prefilled data.
    Onboarding(&'a ScopedVault),
}

impl<'a> PrefillKind<'a> {
    fn allow_prefilling(&self, di: &DataIdentifier) -> bool {
        let is_ci = di.is_unverified_ci() || di.is_verified_ci();
        match self {
            Self::LoginMethods => is_ci,
            // At onboarding time, we don't want to try to prefill CI again since we already did at
            // ScopedVault creation time during the identify flow.
            Self::Onboarding(_) => !is_ci,
        }
    }
}

impl<Type> VaultWrapper<Type> {
    /// Given a user-scoped VW and a destination ScopedVault, computes all of the portable data
    /// that can be prefilled into the destination ScopedVault.
    /// NOTE: it is possible that the portable data is stale by the time we use the PrefillData
    /// result to save data to the destination SV, so we may have old or missing portable data.
    /// This is necessary since we must asynchronously compute the fingerprints before locking the
    /// vault
    #[tracing::instrument(skip_all)]
    pub async fn get_data_to_prefill<'a>(
        &'a self,
        state: &'a State,
        pb: &'a ObConfiguration,
        kind: PrefillKind<'a>,
    ) -> FpResult<PrefillData> {
        let destination_vw = match kind {
            // No existing destination ScopedVault when we're prefilling login methods
            PrefillKind::LoginMethods => None,
            // There's only an existing destination ScopedVault during Onboarding time
            PrefillKind::Onboarding(sv) => {
                let sv_id = sv.id.clone();
                let vw = state
                    .db_pool
                    .db_query(move |conn| VaultWrapper::<Any>::build_for_tenant(conn, &sv_id))
                    .await?;
                Some(vw)
            }
        };
        let destination_vw = destination_vw.as_ref();

        if destination_vw.is_some_and(|vw| vw.scoped_vault.vault_id != self.vault.id) {
            return Err(AssertionError("Cannot prefill data into a separate vault").into());
        }
        if self.vault.kind != VaultKind::Person {
            return Err(AssertionError("Can't prefill business vaults").into());
        }

        // Collect all of the portable data that we can prefill
        let data = self
            .populated_dis()
            .into_iter()
            .filter_map(|di| self.data(&di))
            .filter(|d| d.is_portable())
            // Don't prefill data into a tenant that is already owned by the destination tenant.
            // For ex, will prevent us from prefilling PhoneNumber and Email that were just recently
            // added at this tenant
            // TODO this won't always no-op like we want if the data was portablized at another tenant
            // but is the same data
            .filter(|d| !destination_vw.is_some_and(|vw| vw.scoped_vault.id == d.lifetime.scoped_vault_id))
            // Don't prefill data into this tenant if the exact same data has already been prefilled
            .filter(|d| {
                !destination_vw
                    .and_then(|vw| vw.get_lifetime(&d.lifetime.kind))
                    .and_then(|dl| dl.origin_id.as_ref())
                    .is_some_and(|id| &d.lifetime.id == id)
            })
            .filter(|d| {
                let collected_by_pb =
                    pb.must_collect_data.iter().flat_map(|cdo| cdo.data_identifiers()).flatten().contains(&d.lifetime.kind);
                // Only prefill data into the that must be collected by the tenant's playbook.
                // Except verified CI, we should always prefill
                collected_by_pb || d.lifetime.kind.is_verified_ci()
            })
            .filter(|d| kind.allow_prefilling(&d.lifetime.kind))
            // Note: this won't support portable documents
            .filter_map(|d| if let PieceOfData::Vd(d) = &d.data { Some(d) } else { None })
            .collect_vec();

        //
        // Compute the fingerprints for all data we're going to prefill
        //
        let t_id = &pb.tenant_id;
        let dis = data.iter().map(|d| &d.kind).collect_vec();
        // Specifically throw out the mapping from sh_data -> lifetime_id. The lifetime_ids here
        // belong to the source SV, not the destination SV
        let (fingerprints, _) = self.fingerprint_ciphertext(state, dis, t_id).await?;
        let fingerprints = Fingerprints::new(fingerprints);

        // Collect the ContactInfo from the vault that has the portable phone/email, only for the
        // data that we will be prefilling.
        // For now, we're just going to copy this into the destination vault. This has its
        // limitations, so one day we'll introduce a concept of ContactInfo that is global for a
        // user
        let old_ci_dls = data
            .iter()
            .map(|d| d.kind.clone())
            .filter(|di| di.is_unverified_ci())
            .filter_map(|di| self.get_lifetime(&di).map(|dl| (di, dl.id.clone())))
            .collect_vec();
        let old_ci = state
            .db_pool
            .db_query(|conn| -> FpResult<_> {
                old_ci_dls
                    .into_iter()
                    .map(|(di, dl_id)| -> FpResult<_> {
                        let ci = ContactInfo::get(conn, &dl_id)?;
                        Ok((di, ci))
                    })
                    .collect()
            })
            .await?;

        let data = data
            .into_iter()
            .map(|vd| NewVaultData {
                kind: vd.kind.clone(),
                e_data: vd.e_data.clone(),
                p_data: vd.p_data.clone(),
                format: vd.format,
                // Since we're copying the data from elsewhere, save the lifetime ID
                origin_id: Some(vd.lifetime_id.clone()),
                source: DataLifetimeSource::Prefill,
            })
            .collect_vec();

        tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), "Computed prefill data");

        let result = PrefillData {
            data,
            fingerprints,
            old_ci,
            phantom: PhantomData,
        };
        Ok(result)
    }

    /// Generates fingerprints for the provided DIs from the encrypted data currently in the vault.
    /// Also returns a HashMap that specifies the DataLifetimeId from which each Fingerprint was
    /// generated
    pub async fn fingerprint_ciphertext(
        &self,
        state: &State,
        dis: Vec<&DataIdentifier>,
        tenant_id: &TenantId,
    ) -> FpResult<(
        Vec<(FingerprintSalt, Fingerprint)>,
        HashMap<FingerprintSalt, DataLifetimeId>,
    )> {
        let data_to_fp = dis
            .iter()
            .flat_map(|di| self.data(di))
            .filter_map(|d| {
                if let PieceOfData::Vd(d) = &d.data {
                    Some(d)
                } else {
                    None
                }
            })
            .flat_map(|d| {
                d.kind
                    .get_fingerprint_payload(&d.e_data, Some(tenant_id))
                    .into_iter()
                    // Attach a Key to each fingerprint payload that includes the lifetime ID and salt
                    .map(|(salt, fp)| ((salt.clone(), d.lifetime_id.clone()), (salt, fp)))
            })
            .collect_vec();
        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&self.vault.e_private_key, data_to_fp)
            .await?;
        let (fingerprints, salt_to_lifetime_id) = fingerprints
            .into_iter()
            .map(|((salt, dl_id), fp)| ((salt.clone(), fp), (salt, dl_id)))
            .unzip();
        Ok((fingerprints, salt_to_lifetime_id))
    }
}

impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::prefill_portable_data", skip_all)]
    pub fn prefill_portable_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        prefill_data: PrefillData,
        actor: Option<AuthActor>,
    ) -> FpResult<PatchDataResult> {
        let request = self.validate_prefill_data_request(conn, prefill_data)?;
        let result = self.internal_save_data(conn, request, actor)?;
        Ok(result)
    }
}
