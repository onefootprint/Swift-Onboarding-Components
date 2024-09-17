use super::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::FpResult;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::NewContactInfoArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault_version::ScopedVaultVersion;
use db::models::vault_data::NewVaultData;
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::CollectedDataOption;
use newtypes::ContactInfoPriority;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultVersionNumber;
use std::collections::HashMap;
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
    old_ci: HashMap<DataIdentifier, ContactInfo>,
    /// The list of precomputed fingerprints for the data being saved. Not all fingerprints here
    /// will be saved to the database directly, some are only used to compute composite fingerprints
    new_cdos: HashSet<CollectedDataOption>,
    pub(super) is_prefill: bool,
}

pub struct SavedData {
    pub vd: Vec<VaultData>,
    pub ci: Vec<ContactInfo>,
    pub seqno: DataLifetimeSeqno,
    pub new_version: ScopedVaultVersionNumber,
}

impl ValidatedDataRequest {
    /// Saves the validated updates to the DB
    #[tracing::instrument("ValidatedDataRequest::save", skip_all)]
    pub(super) fn save<Type>(
        self,
        conn: &mut TxnPgConn,
        vw: &WriteableVw<Type>,
        actor: Option<AuthActor>,
    ) -> FpResult<SavedData> {
        let Self {
            data,
            fingerprints,
            new_cdos,
            old_ci,
            is_prefill: _,
        } = self;

        if data.is_empty() {
            // The request is a no-op, no reason to increment the seqno.
            let seqno = DataLifetime::get_current_seqno(conn)?;
            let latest_version = ScopedVaultVersion::version_number_at_seqno(conn, &vw.sv.id, seqno)?;
            return Ok(SavedData {
                vd: vec![],
                ci: vec![],
                seqno,
                new_version: latest_version,
            });
        }

        tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), "Saving DIs");
        let v_id = &vw.vault.id;
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
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_kinds(conn, &vw.sv, kinds_to_deactivate, seqno)?;

        // Create the new VDs
        let actor = actor.map(|a| a.into());
        let (vd, svv) = VaultData::bulk_create(conn, v_id, &vw.sv, data, seqno, actor)?;

        // Save fingerprints
        fingerprints.save(conn, vw, &vd)?;

        // Add contact info for the new CIs added
        let new_contact_info = vd
            .iter()
            .filter(|vd| vd.kind.is_unverified_ci())
            .map(|vd| {
                let old_ci = old_ci.get(&vd.kind);
                NewContactInfoArgs {
                    // Inherit properties of old CI if we are prefilling this CI from portable data
                    is_verified: old_ci.map(|ci| ci.is_verified).unwrap_or(false),
                    is_otp_verified: old_ci.map(|ci| ci.is_otp_verified).unwrap_or(false),
                    priority: old_ci
                        .map(|ci| ci.priority)
                        .unwrap_or(ContactInfoPriority::Primary),
                    lifetime_id: vd.lifetime_id.clone(),
                }
            })
            .collect_vec();
        let ci = ContactInfo::bulk_create(conn, new_contact_info)?;

        let saved_data = SavedData {
            vd,
            ci,
            seqno,
            new_version: svv,
        };
        Ok(saved_data)
    }
}
