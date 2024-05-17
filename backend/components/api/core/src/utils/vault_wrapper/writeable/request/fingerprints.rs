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

use crate::errors::{ApiResult, AssertionError};


#[derive(Debug, Clone, derive_more::Deref)]
pub(in super::super) struct Fingerprints(Vec<(FingerprintSalt, Fingerprint)>);

impl Fingerprints {
    pub fn new(data: Vec<(FingerprintSalt, Fingerprint)>) -> Self {
        Self(data)
    }

    pub fn save(self, conn: &mut TxnPgConn, sv: &ScopedVault, vd: &[VaultData]) -> ApiResult<()> {
        let Self(fingerprints) = self;

        struct FingerprintData<'a> {
            kind: FingerprintKind,
            data: FingerprintDataValue,
            lifetime_ids: Vec<&'a DataLifetimeId>,
            scope: FingerprintVariant,
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
                scope: FingerprintVariant::Plaintext,
            });

        // Create composite fingerprints out of pre-computed partial fingerprints
        let partial_fps: HashMap<_, _> = fingerprints
            .into_iter()
            .filter_map(|(salt, fp)| {
                let FingerprintSalt::Partial(pfpk) = salt else {
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
                    scope: FingerprintVariant::Composite,
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
        DbFingerprint::bulk_create(conn, fingerprints)?;

        Ok(())
    }
}
