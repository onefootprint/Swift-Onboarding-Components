use super::WriteableVw;
use crate::{auth::tenant::AuthActor, errors::ApiResult};
use db::{
    models::{
        contact_info::{ContactInfo, NewContactInfoArgs},
        data_lifetime::DataLifetime,
        scoped_vault::ScopedVault,
        vault_data::{NewVaultData, VaultData},
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{output::Csv, CollectedDataOption, ContactInfoPriority, DataIdentifier, DataLifetimeSeqno};
use std::collections::{HashMap, HashSet};

mod fingerprinted;
mod fingerprints;
mod prefill;
mod validation;

use self::fingerprints::Fingerprints;

pub use fingerprinted::FingerprintedDataRequest;
pub use prefill::{PrefillData, PrefillKind};
pub use validation::{DataLifetimeSources, DataRequestSource};

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    pub(super) data: Vec<NewVaultData>,
    fingerprints: Fingerprints,
    /// On prefilled ValidatedDataRequests, includes the existing CI for any phone/email being prefilled
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
}

impl ValidatedDataRequest {
    /// Saves the validated updates to the DB
    #[tracing::instrument("ValidatedDataRequest::save", skip_all)]
    pub(super) fn save<Type>(
        self,
        conn: &mut TxnPgConn,
        vw: &WriteableVw<Type>,
        actor: Option<AuthActor>,
    ) -> ApiResult<SavedData> {
        let Self {
            data,
            fingerprints,
            new_cdos,
            old_ci,
            is_prefill: _,
        } = self;

        if data.is_empty() {
            // The request is a no-op, no reason to increment the seqno
            let seqno = DataLifetime::get_current_seqno(conn)?;
            return Ok(SavedData {
                vd: vec![],
                ci: vec![],
                seqno,
            });
        }

        tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), "Saving DIs");
        let sv_id = &vw.scoped_vault_id;
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
        DataLifetime::bulk_deactivate_kinds(conn, sv_id, kinds_to_deactivate, seqno)?;

        // Create the new VDs
        let actor = actor.map(|a| a.into());
        let vd = VaultData::bulk_create(conn, v_id, sv_id, data, seqno, actor)?;
        let sv = ScopedVault::get(conn, sv_id)?;

        // Save fingerprints
        fingerprints.save(conn, &sv, &vd)?;

        // Add contact info for the new CIs added
        let new_contact_info = vd
            .iter()
            .filter(|vd| vd.kind.is_contact_info())
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

        let saved_data = SavedData { vd, ci, seqno };
        Ok(saved_data)
    }
}
