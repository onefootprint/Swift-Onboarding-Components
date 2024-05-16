use super::{PatchDataResult, WriteableVw};
use crate::{
    auth::tenant::AuthActor,
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::{Any, PieceOfData, TenantVw, VaultWrapper},
    State,
};
use db::{
    models::{
        contact_info::ContactInfo, ob_configuration::ObConfiguration, scoped_vault::ScopedVault,
        vault_data::NewVaultData,
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    output::Csv, DataIdentifier, DataLifetimeSource, FingerprintRequest, IdentityDataKind as IDK, VaultKind,
};
use std::{collections::HashMap, marker::PhantomData};

/// Precomputed portable data from the user-scoped vault that we will use to prefill data for a new
/// tenant.
/// NOTE: it is possible that the portable data is stale by the time we use the PrefillData
/// result to save data to the destination SV, so we may have old or missing portable data.
/// This is necessary since we must asynchronously compute the fingerprints before locking the
/// vault
pub struct PrefillData {
    pub data: Vec<NewVaultData>,
    pub fingerprints: Vec<FingerprintRequest>,
    pub old_ci: HashMap<DataIdentifier, ContactInfo>,
    /// Prevent external construction
    phantom: PhantomData<()>,
}

pub enum PrefillKind {
    /// After the identify flow, prefill login methods
    Identify,
    /// When starting onboarding, prefill all data required by the playbook. We shouldn't do this
    /// before creating the Workflow in the database, otherwise we'll unintentionally give decrypt
    /// access to all prefilled data.
    Onboarding,
}

impl PrefillKind {
    fn allow_prefilling(&self, di: &DataIdentifier) -> bool {
        match self {
            Self::Identify => matches!(
                di,
                DataIdentifier::Id(IDK::PhoneNumber) | DataIdentifier::Id(IDK::Email)
            ),
            Self::Onboarding => true,
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
        destination_sv: &'a ScopedVault,
        pb: &'a ObConfiguration,
        kind: PrefillKind,
    ) -> ApiResult<PrefillData> {
        if self.vault.id != destination_sv.vault_id {
            return Err(AssertionError("Cannot prefill data into a separate vault").into());
        }
        if self.vault.kind != VaultKind::Person {
            return Err(AssertionError("Can't prefill business vaults").into());
        }

        let sv_id = destination_sv.id.clone();
        let destination_vw: TenantVw<Any> = state
            .db_pool
            .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
            .await?;

        // Collect all of the portable data that we can prefill
        let data = self
            .populated_dis()
            .into_iter()
            .filter_map(|di| self.data(&di))
            .filter(|d| d.is_portable())
            // Don't prefill data into a tenant that is already owned by the tenant.
            // For ex, will prevent us from prefilling PhoneNumber and Email that were just recently
            // added at this tenant
            // TODO this won't always no-op like we want if the data was portablized at another tenant
            // but is the same data
            .filter(|d| d.lifetime.scoped_vault_id != destination_sv.id)
            // Don't prefill data into this tenant if the exact same data has already been prefilled
            .filter(|d| {
                let existing_dl = destination_vw.get_lifetime(&d.lifetime.kind);
                !existing_dl.and_then(|dl| dl.origin_id.as_ref()).is_some_and(|id| &d.lifetime.id == id)
            })
            // Only autofill data into the that must be collected by the tenant's playbook
            .filter(|d| pb.must_collect_data.iter().any(|cdo| cdo.data_identifiers().unwrap_or_default().contains(&d.lifetime.kind)))
            .filter(|d| kind.allow_prefilling(&d.lifetime.kind))
            // Note: this won't support portable documents
            .filter_map(|d| if let PieceOfData::Vd(d) = &d.data { Some(d) } else { None })
            .collect_vec();

        //
        // Compute the fingerprints for all data we're going to prefill
        //
        let tenant_id = Some(&destination_sv.tenant_id);
        let data_to_fingerprint = data
            .iter()
            .flat_map(|d| d.kind.get_fingerprint_payload(&d.e_data, tenant_id))
            .collect_vec();

        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&self.vault.e_private_key, data_to_fingerprint)
            .await?;
        // TODO composite fingerprints here too
        let fingerprints = fingerprints
            .into_iter()
            .map(|((kind, scope), fingerprint)| FingerprintRequest {
                kind,
                scope,
                fingerprint,
            })
            .collect();

        // Collect the ContactInfo from the vault that has the portable phone/email, only for the
        // data that we will be prefilling.
        // For now, we're just going to copy this into the destination vault. This has its
        // limitations, so one day we'll introduce a concept of ContactInfo that is global for a
        // user
        let old_ci_dls = data
            .iter()
            .map(|d| d.kind.clone())
            .filter(|di| di.is_contact_info())
            .filter_map(|di| self.get_lifetime(&di).map(|dl| (di, dl.id.clone())))
            .collect_vec();
        let old_ci = state
            .db_pool
            .db_query(|conn| -> ApiResult<_> {
                old_ci_dls
                    .into_iter()
                    .map(|(di, dl_id)| -> ApiResult<_> {
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
}

impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::prefill_portable_data", skip_all)]
    pub fn prefill_portable_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        prefill_data: PrefillData,
        actor: Option<AuthActor>,
    ) -> ApiResult<PatchDataResult> {
        let request = self.validate_prefill_data_request(conn, prefill_data)?;
        let result = self.internal_save_data(conn, request, actor)?;
        Ok(result)
    }
}
