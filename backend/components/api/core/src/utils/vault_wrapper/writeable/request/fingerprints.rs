use std::collections::HashMap;

use db::{
    models::{
        fingerprint::{Fingerprint as DbFingerprint, FingerprintDataValue, NewFingerprintArgs},
        scoped_vault::ScopedVault,
        vault_data::VaultData,
    },
    TxnPgConn,
};
use itertools::{chain, Itertools};
use newtypes::{
    fingerprint_salt::FingerprintSalt, CompositeFingerprintKind, DataLifetimeId, Fingerprint,
    FingerprintKind, FingerprintVariant, MissingPartialFingerprint,
};
use strum::IntoEnumIterator;

use crate::{
    errors::{ApiResult, AssertionError, ValidationError},
    utils::vault_wrapper::WriteableVw,
};


#[derive(Debug, Clone, derive_more::Deref)]
pub(in super::super) struct Fingerprints {
    #[deref]
    fps: Vec<(FingerprintSalt, Fingerprint)>,
    salt_to_dl_id: HashMap<FingerprintSalt, DataLifetimeId>,
}

impl Fingerprints {
    pub fn new(fps: Vec<(FingerprintSalt, Fingerprint)>) -> Self {
        let salt_to_dl_id = HashMap::new();
        Self { fps, salt_to_dl_id }
    }

    pub fn extend(
        &mut self,
        fps: Vec<(FingerprintSalt, Fingerprint)>,
        salt_to_dl_id: HashMap<FingerprintSalt, DataLifetimeId>,
    ) {
        self.fps.extend(fps);
        self.salt_to_dl_id.extend(salt_to_dl_id);
    }

    pub fn save<Type>(
        self,
        conn: &mut TxnPgConn,
        vw: &WriteableVw<Type>,
        new_vd: &[VaultData],
    ) -> ApiResult<()> {
        let Self { fps, salt_to_dl_id } = self;

        struct FingerprintData<'a> {
            kind: FingerprintKind,
            data: FingerprintDataValue,
            lifetime_ids: Vec<&'a DataLifetimeId>,
            scope: FingerprintVariant,
        }

        //
        // Create fingerprints for every piece of vault data we've saved
        //
        let sh_data_fingerprints = new_vd
            .iter()
            .filter(|vd| vd.kind.is_fingerprintable())
            .flat_map(|vd| {
                let fps = fps
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

        //
        // Some DIs are stored in plaintext and searchable - we want to make fingeprint rows for these too
        //
        let p_data_fingerprints = new_vd
            .iter()
            .filter(|vd| vd.kind.store_plaintext() && vd.kind.is_fingerprintable())
            .filter_map(|vd| vd.p_data.as_ref().map(|p_data| (p_data.clone(), vd)))
            .map(|(p_data, vd)| FingerprintData {
                kind: FingerprintKind::DI(vd.kind.clone()),
                data: p_data.into(),
                lifetime_ids: vec![&vd.lifetime_id],
                scope: FingerprintVariant::Plaintext,
            });

        //
        // Create composite fingerprints out of pre-computed partial fingerprints
        //
        let partial_fps: HashMap<_, _> = fps
            .into_iter()
            .filter_map(|(salt, fp)| {
                let FingerprintSalt::Partial(pfpk) = salt else {
                    return None;
                };
                Some((pfpk, fp))
            })
            .collect();
        let vd_kinds = new_vd.iter().map(|vd| &vd.kind).collect_vec();
        let composite_fingerprints = CompositeFingerprintKind::iter()
            .filter(|cfpk| cfpk.contains(&vd_kinds))
            .map(|cfpk| -> ApiResult<_> {
                // For each Composite FPK that has any DI represented in this data update, generate
                // the new composite fingerprint out of the pre-computed partial fingerprints
                let sh_data = match cfpk.compute(&partial_fps) {
                    Ok(sh_data) => sh_data,
                    Err(MissingPartialFingerprint(pfpk)) => {
                        tracing::error!(%pfpk, "Failed to compute composite fingerprint. Missing partial fingerprint");
                        return Ok(None);
                    }
                };

                // This composite fingerprint will be linked to multiple DataLifetimes, so when any
                // of the constituent pieces of data is deactivated, this fingerprint will be too.
                // The lifetime could be from a newly created VD, or from a VD that already exists.
                let new_vd_lifetime_ids = new_vd
                    .iter()
                    .filter(|vd| cfpk.contains(&[&vd.kind]))
                    .map(|vd| &vd.lifetime_id);
                let existing_vd_lifetime_ids = cfpk
                    .partial_fp_kinds()
                    .into_iter()
                    .flat_map(|pfpk| salt_to_dl_id.get(&pfpk.into()));
                let lifetime_ids = chain(new_vd_lifetime_ids, existing_vd_lifetime_ids).collect_vec();
                if lifetime_ids.len() != cfpk.partial_fp_kinds().len() {
                    return AssertionError("Not one lifetime ID for every partial fingerprint").into();
                }
                let d = FingerprintData {
                    kind: cfpk.into(),
                    data: sh_data.into(),
                    lifetime_ids,
                    scope: FingerprintVariant::Composite,
                };
                Ok(Some(d))
            })
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .flatten();
        // We are susceptible to a race condition... Our partial fingerprints may be stale if the
        // vault data changed since we computed them. This may happen since we cannot lock the
        // vault while computing partial fingerprints.
        // If the partial fingeprints are stale, we've made the arbitrary decision to error.
        for (salt, dl_id) in salt_to_dl_id.iter() {
            let new_dl_id = vw.get_lifetime(&salt.di()).map(|dl| &dl.id);
            if new_dl_id != Some(dl_id) {
                tracing::error!(di=%salt.di(), old_dl_id=%dl_id, ?new_dl_id, "Aborted data update due to stale partial fingerprint");
                return ValidationError(
                    "Operation aborted due to a concurrent update on this user. Please retry this request",
                )
                .into();
            }
        }

        //
        // Save fingerprints to the database
        //

        let sv = ScopedVault::get(conn, &vw.scoped_vault_id)?;
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
        DbFingerprint::bulk_create(conn, fingerprints)?;

        Ok(())
    }
}
