use super::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::FpResult;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::NewContactInfoArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::data_lifetime::DataLifetimeSeqnoTxn;
use db::models::vault_data::NewVaultData;
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::ScopedVaultVersionNumber;
use std::collections::HashSet;

mod fingerprinted;
mod fingerprints;
mod prefill;
mod validation;

use self::fingerprints::Fingerprints;
pub use fingerprinted::FingerprintedDataRequest;
pub use prefill::PrefillData;
pub use prefill::PrefillKind;
pub use validation::DataRequestSource;
pub use validation::DlSourceWithOverrides;

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    pub(super) data: Vec<NewVaultData>,
    fingerprints: Fingerprints,
    /// On prefilled ValidatedDataRequests, includes the existing CI for any phone/email being
    /// prefilled
    new_ci: Vec<NewContactInfoArgs<DataIdentifier>>,
    /// The list of precomputed fingerprints for the data being saved. Not all fingerprints here
    /// will be saved to the database directly, some are only used to compute composite fingerprints
    new_cdos: HashSet<CollectedDataOption>,
    pub(super) is_prefill: bool,
}

pub struct SavedData {
    pub vd: Vec<VaultData>,
    pub ci: Vec<ContactInfo>,
    pub sv_txn: DataLifetimeSeqnoTxn<'static>,
    pub new_version: ScopedVaultVersionNumber,
}

impl ValidatedDataRequest {
    pub(super) fn is_empty(&self) -> bool {
        self.data.is_empty()
    }

    /// Saves the validated updates to the DB
    #[tracing::instrument("ValidatedDataRequest::save", skip_all)]
    pub(super) fn save<Type>(
        self,
        conn: &mut TxnPgConn,
        vw: WriteableVw<Type>,
        actor: Option<AuthActor>,
    ) -> FpResult<SavedData> {
        let Self {
            data,
            fingerprints,
            new_cdos,
            new_ci,
            is_prefill: _,
        } = self;

        let fingerprints = fingerprints.validate(&vw)?;

        tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), "Saving DIs");
        // Deactivate old VDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let overwrite_kinds = new_cdos
            .iter()
            .flat_map(|cdo| cdo.parent().options())
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default());
        let added_kinds = data.iter().map(|nvd| nvd.kind.clone());
        let kinds_to_deactivate = added_kinds
            // Even if we're not providing all fields for a CDO, deactivate old versions of all
            // fields in the CDO. For example, address line 2
            .chain(overwrite_kinds)
            .unique()
            .collect();
        let sv_txn = DataLifetime::new_sv_txn(conn, vw.sv)?;
        DataLifetime::bulk_deactivate_kinds(conn, &sv_txn, kinds_to_deactivate)?;

        // Create the new VDs
        let actor = actor.map(|a| a.into());
        let (vd, svv) = VaultData::bulk_create(conn, &sv_txn, data, actor)?;

        // Save fingerprints
        let sv = sv_txn.scoped_vault();
        fingerprints.save(conn, sv, &vd)?;

        // Add contact info for the new CIs added
        let new_contact_info = vd
            .iter()
            .filter(|vd| vd.kind.is_unverified_ci())
            .map(|vd| {
                let new_ci = new_ci.iter().find(|ci| ci.identifier == vd.kind);
                NewContactInfoArgs {
                    // Inherit properties of old CI if we are prefilling this CI from portable data
                    is_otp_verified: new_ci.is_some_and(|ci| ci.is_otp_verified),
                    is_tenant_verified: new_ci.is_some_and(|ci| ci.is_tenant_verified),
                    identifier: vd.lifetime_id.clone(),
                }
            })
            .collect_vec();
        let ci = ContactInfo::bulk_create(conn, new_contact_info)?;

        let saved_data = SavedData {
            vd,
            ci,
            sv_txn,
            new_version: svv,
        };
        Ok(saved_data)
    }
}
