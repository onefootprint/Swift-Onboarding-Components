pub use self::fingerprint::Fingerprints;

use super::WriteableVw;
use crate::{
    auth::tenant::AuthActor,
    errors::{ApiResult, AssertionError},
};
use db::{
    models::{
        contact_info::{ContactInfo, NewContactInfoArgs},
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, FingerprintDataValue, NewFingerprintArgs},
        scoped_vault::ScopedVault,
        vault_data::{NewVaultData, VaultData},
    },
    TxnPgConn,
};
use itertools::{chain, Itertools};
use newtypes::{
    fingerprinter::FingerprintScope, output::Csv, CollectedDataOption, CompositeFingerprintKind,
    ContactInfoPriority, DataIdentifier, DataLifetimeId, DataLifetimeSeqno, FingerprintKind,
    FingerprintScopeKind, MissingPartialFingerprint,
};
use std::collections::{HashMap, HashSet};
use strum::IntoEnumIterator;

mod fingerprint;
mod validation;

pub use fingerprint::FingerprintedDataRequest;
pub use validation::{DataLifetimeSources, DataRequestSource};

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    pub(super) data: Vec<NewVaultData>,
    /// On prefilled ValidatedDataRequests, includes the existing CI for any phone/email being prefilled
    old_ci: HashMap<DataIdentifier, ContactInfo>,
    /// The list of precomputed fingerprints for the data being saved. Not all fingerprints here
    /// will be saved to the database directly, some are only used to compute composite fingerprints
    fingerprints: Fingerprints,
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
        Self::save_fingerprints(conn, fingerprints, &sv, &vd)?;

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

    fn save_fingerprints(
        conn: &mut TxnPgConn,
        fingerprints: Fingerprints,
        sv: &ScopedVault,
        vd: &[VaultData],
    ) -> ApiResult<()> {
        struct FingerprintData<'a> {
            kind: FingerprintKind,
            data: FingerprintDataValue,
            lifetime_ids: Vec<&'a DataLifetimeId>,
            scope: FingerprintScopeKind,
        }

        // Create fingerprints for every piece of vault data we've saved
        let sh_data_fingerprints = vd
            .iter()
            .filter(|vd| vd.kind.is_fingerprintable())
            .flat_map(|vd| {
                let fps = fingerprints
                    .iter()
                    .filter(|(scope, _)| scope.di() == vd.kind)
                    // Don't save partial fingerprints to the database
                    .filter_map(|(scope, fp)| scope.kind().map(|k| (scope, k, fp)))
                    .map(|(scope, scope_kind, fp)| FingerprintData {
                        kind: scope.di().into(),
                        data: fp.clone().into(),
                        lifetime_ids: vec![&vd.lifetime_id],
                        scope: scope_kind,
                    })
                    .collect_vec();
                if fps.is_empty() {
                    tracing::error!(di=%vd.kind, "Missing expected fingerprint");
                }
                fps
            })
            .collect_vec();

        // Some DIs are stored in plaintext and searchable - we want to make fingeprint rows for these too
        let p_data_fingerprints = vd
            .iter()
            .filter(|vd| vd.kind.store_plaintext() && vd.kind.is_fingerprintable())
            .filter_map(|vd| vd.p_data.as_ref().map(|p_data| (p_data.clone(), vd)))
            .map(|(p_data, vd)| FingerprintData {
                kind: FingerprintKind::DI(vd.kind.clone()),
                data: p_data.into(),
                lifetime_ids: vec![&vd.lifetime_id],
                scope: FingerprintScopeKind::Plaintext,
            });

        // Create composite fingerprints out of pre-computed partial fingerprints
        let partial_fps: HashMap<_, _> = fingerprints
            .into_iter()
            .filter_map(|(scope, fp)| {
                let FingerprintScope::Partial(pfpk) = scope else {
                    return None;
                };
                Some((pfpk, fp))
            })
            .collect();
        let vd_kinds = vd.iter().map(|vd| &vd.kind).collect_vec();
        let composite_fingerprints = CompositeFingerprintKind::iter()
            .filter(|cfpk| cfpk.contains(&vd_kinds))
            .map(|cfpk| -> ApiResult<_> {
                // For each Composite FPK that has any DI represented in this data update, generate
                // the new composite fingerprint out of the pre-computed partial fingerprints
                let sh_data = match cfpk.compute(&partial_fps) {
                    Ok(sh_data) => sh_data,
                    Err(MissingPartialFingerprint(pfpk)) => {
                        // TODO one day hard error here, or tracing::error.
                        // We'll see this for any time a data update only updates part of a
                        // composite fingerprint
                        tracing::info!(%pfpk, "Failed to compute composite fingerprint. Missing partial fingerprint");
                        return Ok(None);
                    }
                };
                let lifetime_ids = vd
                    .iter()
                    .filter(|vd| cfpk.contains(&[&vd.kind]))
                    .map(|vd| &vd.lifetime_id)
                    .collect_vec();
                if lifetime_ids.len() != cfpk.partial_fp_kinds().len() {
                    // TODO eventually also look for lifetime_ids from existing vault data
                    return AssertionError("Missing lifetime for composite fingerprint").into();
                }
                let d = FingerprintData {
                    kind: cfpk.into(),
                    data: sh_data.into(),
                    lifetime_ids,
                    scope: FingerprintScopeKind::Composite,
                };
                Ok(Some(d))
            })
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .flatten();

        let fingerprints = chain!(sh_data_fingerprints, p_data_fingerprints, composite_fingerprints)
            .map(|d| {
                let FingerprintData {
                    kind,
                    data,
                    lifetime_ids,
                    scope,
                } = d;
                NewFingerprintArgs {
                    kind,
                    data,
                    lifetime_ids,
                    scope,
                    version: newtypes::FingerprintVersion::current(),
                    // Denormalized fields
                    scoped_vault_id: &sv.id,
                    vault_id: &sv.vault_id,
                    tenant_id: &sv.tenant_id,
                    is_live: sv.is_live,
                }
            })
            .collect();
        Fingerprint::bulk_create(conn, fingerprints)?;

        Ok(())
    }
}
