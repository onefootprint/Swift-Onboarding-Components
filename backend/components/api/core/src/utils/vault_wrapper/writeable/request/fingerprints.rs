use crate::errors::AssertionError;
use crate::errors::ValidationError;
use crate::utils::vault_wrapper::WriteableVw;
use crate::FpResult;
use db::models::fingerprint::Fingerprint as DbFingerprint;
use db::models::fingerprint::FingerprintDataValue;
use db::models::fingerprint::NewFingerprintArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::CompositeFingerprint;
use newtypes::CompositeFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::Fingerprint;
use newtypes::FingerprintKind;
use newtypes::FingerprintScope;
use newtypes::Locked;
use newtypes::MissingFingerprint;
use std::collections::HashMap;

#[derive(Debug, Clone, derive_more::Deref)]
pub(in super::super) struct Fingerprints {
    #[deref]
    fps: Vec<(FingerprintSalt, Fingerprint)>,
    salt_to_dl_id: HashMap<FingerprintSalt, DataLifetimeId>,
}

pub(in super::super) struct ValidatedFingerprints {
    fingerprints: Fingerprints,

    // Stored here since the VaultWrapper is invalidated after updating data.
    dis_before_vw_update: Vec<DataIdentifier>,
}

impl Fingerprints {
    pub(super) fn new(fps: Vec<(FingerprintSalt, Fingerprint)>) -> Self {
        let salt_to_dl_id = HashMap::new();
        Self { fps, salt_to_dl_id }
    }

    pub(super) fn extend(
        &mut self,
        fps: Vec<(FingerprintSalt, Fingerprint)>,
        salt_to_dl_id: HashMap<FingerprintSalt, DataLifetimeId>,
    ) {
        self.fps.extend(fps);
        self.salt_to_dl_id.extend(salt_to_dl_id);
    }

    pub(super) fn validate<Type>(self, vw: &WriteableVw<Type>) -> FpResult<ValidatedFingerprints> {
        // We are susceptible to a race condition... Our transient fingerprints may be stale if the
        // vault data changed since we computed them. This may happen since we cannot lock the
        // vault while computing transient fingerprints.
        // If the transient fingeprints are stale, we've made the arbitrary decision to error.
        for (salt, dl_id) in self.salt_to_dl_id.iter() {
            let new_dl_id = vw.get_lifetime(&salt.di()).map(|dl| &dl.id);
            if new_dl_id != Some(dl_id) {
                tracing::error!(di=%salt.di(), old_dl_id=%dl_id, ?new_dl_id, "Aborted data update due to stale transient fingerprint");
                return ValidationError(
                    "Operation aborted due to a concurrent update on this user. Please retry this request",
                )
                .into();
            }
        }

        Ok(ValidatedFingerprints {
            fingerprints: self,
            dis_before_vw_update: vw.populated_dis(),
        })
    }
}
impl ValidatedFingerprints {
    pub(super) fn save(
        self,
        conn: &mut TxnPgConn,
        sv: &Locked<ScopedVault>,
        new_vd: &[VaultData],
    ) -> FpResult<()> {
        let Self {
            fingerprints: Fingerprints { fps, salt_to_dl_id },
            dis_before_vw_update,
        } = self;

        struct FingerprintData<'a> {
            kind: FingerprintKind,
            data: FingerprintDataValue,
            lifetime_ids: Vec<&'a DataLifetimeId>,
            scope: FingerprintScope,
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
                    .filter(|(salt, _)| salt.di() == vd.kind)
                    // Don't save transient fingerprints to the database
                    .filter_map(|(salt, fp)| salt.scope().map(|scope| (salt, scope, fp)))
                    .map(|(salt, scope, fp)| FingerprintData {
                        kind: salt.di().into(),
                        data: fp.clone().into(),
                        lifetime_ids: vec![&vd.lifetime_id],
                        scope,
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
                scope: FingerprintScope::Plaintext,
            });

        //
        // Create composite fingerprints out of pre-computed transient fingerprints
        //
        let fps: HashMap<_, _> = fps.into_iter().collect();
        let new_vd: HashMap<_, _> = new_vd.iter().map(|vd| (&vd.kind, vd)).collect();
        let vd_kinds = new_vd.keys().cloned().collect_vec();

        let composite_fingerprints = CompositeFingerprint::list(&sv.tenant_id, &vd_kinds)
            .into_iter()
            .filter(|cfp| cfp.should_generate(&dis_before_vw_update, &vd_kinds))
            .map(|cfp| -> FpResult<_> {
                // For each Composite FPK that has any DI represented in this data update, generate
                // the new composite fingerprint out of the pre-computed transient fingerprints
                let sh_data = match cfp.compute(&fps) {
                    Ok(sh_data) => sh_data,
                    Err(MissingFingerprint(salt)) => {
                        tracing::error!(
                            ?salt,
                            "Failed to compute composite fingerprint. Missing fingerprint"
                        );
                        return Ok(None);
                    }
                };

                // This composite fingerprint will be linked to multiple DataLifetimes, so when any
                // of the constituent pieces of data is deactivated, this fingerprint will be too.
                // The lifetime could be from a newly created VD, or from a VD that already exists.
                let new_vd_lifetime_ids = cfp
                    .salts()
                    .into_iter()
                    .flat_map(|salt| new_vd.get(&salt.di()))
                    .map(|vd| &vd.lifetime_id);
                let existing_vd_lifetime_ids =
                    cfp.salts().into_iter().flat_map(|salt| salt_to_dl_id.get(&salt));
                let lifetime_ids = chain(new_vd_lifetime_ids, existing_vd_lifetime_ids).collect_vec();
                if lifetime_ids.len() != cfp.salts().len() {
                    return AssertionError("Need exactly one lifetime ID for each transient fingerprint")
                        .into();
                }
                let cfpk = CompositeFingerprintKind::from(&cfp);
                let d = FingerprintData {
                    kind: cfpk.into(),
                    data: sh_data.into(),
                    lifetime_ids,
                    scope: cfpk.scope(),
                };
                Ok(Some(d))
            })
            .collect::<FpResult<Vec<_>>>()?
            .into_iter()
            .flatten();

        //
        // Save fingerprints to the database
        //

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
