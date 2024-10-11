use super::super::PatchDataResult;
use super::Fingerprints;
use super::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::NewContactInfoArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_data::NewVaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::IdentityDataKind as IDK;
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
    pub(in super::super) new_ci: Vec<NewContactInfoArgs<DataIdentifier>>,
    /// Prevent external construction
    phantom: PhantomData<()>,
}

/// Prefill happens in two steps: first, when the ScopedVault is created in POST /hosted/identify,
/// we prefill auth methods into the newly created ScopedVault. Second, when onboarding begins, we
/// prefill other KYC data that's used by the playbook.
pub enum PrefillKind<'a> {
    /// After the identify flow, prefill login methods.
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
        // NOTE: self here is a user-scoped VW with only portable data
        &'a self,
        state: &'a State,
        pb: &'a ObConfiguration,
        prefill_kind: PrefillKind<'a>,
    ) -> FpResult<PrefillData> {
        let destination_vw = match prefill_kind {
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
        let mut dis_to_prefill = self.populated_dis();

        // Tenants may have different _unverified_ contact info from _verified_ contact info.
        // If there's a _verified_ piece of contact info, prefill only that and omit any unverified info to
        // prevent prefilling, for ex, id.verified_email that's different from id.email.
        // The unverified DIs will be derived from the verified information below.
        if dis_to_prefill.contains(&IDK::VerifiedPhoneNumber.into()) {
            dis_to_prefill.retain(|di| di != &IDK::PhoneNumber.into())
        }
        if dis_to_prefill.contains(&IDK::VerifiedEmail.into()) {
            dis_to_prefill.retain(|di| di != &IDK::Email.into())
        }

        let dis_to_prefill = dis_to_prefill
            .into_iter()
            .filter(|d| prefill_kind.allow_prefilling(d))
            .filter(|d| {
                let collected_by_pb = pb
                    .must_collect_data
                    .iter()
                    .any(|cdo| cdo.data_identifiers().unwrap_or_default().contains(d));
                // Only prefill data into the that must be collected by the tenant's playbook.
                // Except verified CI, we should always prefill
                collected_by_pb || d.is_verified_ci()
            });

        let data = dis_to_prefill
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
            // Note: this won't support portable documents
            .filter_map(|d| d.data.vd())
            .collect_vec();

        //
        // Compute the set of NewVaultData we're going to save.
        //

        let data = data
            .into_iter()
            .map(|vd| {
                let mut dis = vec![vd.kind.clone()];
                // If we're prefilling a piece of verified contact info, derive the unverified info too
                match vd.kind {
                    DataIdentifier::Id(IDK::VerifiedPhoneNumber) => dis.push(IDK::PhoneNumber.into()),
                    DataIdentifier::Id(IDK::VerifiedEmail) => dis.push(IDK::Email.into()),
                    _ => (),
                }
                (vd, dis)
            })
            .flat_map(|(vd, dis)| {
                dis.into_iter().map(|di| NewVaultData {
                    kind: di,
                    e_data: vd.e_data.clone(),
                    p_data: vd.p_data.clone(),
                    format: vd.format,
                    // Since we're copying the data from elsewhere, save the lifetime ID
                    origin_id: Some(vd.lifetime_id.clone()),
                    source: DataLifetimeSource::Prefill,
                })
            })
            .collect_vec();

        //
        // Compute the fingerprints for all data we're going to prefill
        //

        let data_to_fp = data
            .iter()
            .flat_map(|d| d.kind.get_fingerprint_payload(&d.e_data, Some(&pb.tenant_id)))
            // Attach a Key to each fingerprint payload that includes the salt
            .map(|(salt, e_data)| (salt.clone(), (salt, e_data)))
            .collect_vec();
        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&self.vault.e_private_key, data_to_fp)
            .await?;

        //
        // Compute the composite fingerprints for all data that we're going to prefill
        //
        let salt_to_fp = fingerprints.iter().cloned().collect();
        let new_dis = data.iter().map(|vd| &vd.kind).collect_vec();

        let (composite_fingerprints, addl_dis) = FingerprintedDataRequest::generate_composite_fingerprints(
            &salt_to_fp,
            &[],
            &new_dis,
            &pb.tenant_id,
        )?;

        if !addl_dis.is_empty() {
            tracing::error!(dis=%Csv::from(addl_dis.keys().cloned().collect_vec()), "Got derived DIs when prefilling data, but this is unimplemented");
        }

        let fingerprints = Fingerprints::new(fingerprints, composite_fingerprints, HashMap::new());

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
        let new_ci = state
            .db_pool
            .db_query(|conn| -> Result<_, _> {
                old_ci_dls
                    .into_iter()
                    .map(|(di, dl_id)| ContactInfo::get(conn, &dl_id).map(|ci| (di, ci)))
                    .map_ok(|(di, old_ci)| old_ci.replacement_ci(di))
                    .collect()
            })
            .await?;

        tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), "Computed prefill data");
        let result = PrefillData {
            data,
            fingerprints,
            new_ci,
            phantom: PhantomData,
        };
        Ok(result)
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
        let request = self.validate_prefill_data_request(prefill_data)?;
        let result = self.internal_save_data(conn, request, actor)?;
        Ok(result)
    }
}
