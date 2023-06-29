use std::collections::HashSet;

use crate::{
    errors::{user::UserError, ApiResult, AssertionError},
    utils::vault_wrapper::VaultWrapper,
};
use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        vault::Vault,
        vault_data::{NewVaultData, VaultData},
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    BusinessDataKind as BDK, CollectedDataOption, DataRequest, FingerprintRequest, FingerprintScopeKind,
    Fingerprints, IdentityDataKind as IDK, ScopedVaultId,
};

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    data: Vec<NewVaultData>,
    fingerprints: Fingerprints,
    new_cdos: HashSet<CollectedDataOption>,
}

impl<Type> VaultWrapper<Type> {
    /// Given a DataRequest, validate some invariants before allowing it to be written to the vault.
    /// These invariants are also a function of the data in the vault at the time
    pub fn validate_request(&self, request: DataRequest<Fingerprints>) -> ApiResult<ValidatedDataRequest> {
        // Don't allow replacing some pieces of info
        let irreplaceable_dis = if self.vault.is_portable {
            // TODO really just want to avoid replacing verified phone and email
            vec![
                (IDK::PhoneNumber.into(), true),
                (IDK::Email.into(), false),
                (BDK::KycedBeneficialOwners.into(), true),
            ]
        } else {
            vec![(BDK::KycedBeneficialOwners.into(), true)]
        };
        for (di, check_portable_and_speculative) in irreplaceable_dis {
            let update_has_di = request.keys().any(|x| x == &di);
            let vault_already_has_di = if check_portable_and_speculative {
                // Some fields we are not allowed to update as soon as they are set on the vault,
                // whether speculative or portablized
                self.get(di.clone()).is_some()
            } else {
                // Other fields we only cannot replace if they are portablized
                self.portable.get(di.clone()).is_some()
            };
            if update_has_di && vault_already_has_di {
                // We don't currently support adding a phone/email
                return Err(UserError::CannotReplaceData(di).into());
            }
        }

        // Then, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let existing_cdos = CollectedDataOption::list_from(self.populated_dis());
        let new_cdos = CollectedDataOption::list_from(request.keys().cloned().collect());
        let offending_partial_cdo =
            new_cdos
                .iter()
                .cloned()
                .find(|speculative_cdo| match speculative_cdo.full_variant() {
                    Some(full_cdo) => existing_cdos.contains(&full_cdo),
                    None => false,
                });
        if let Some(offending_partial_cdo) = offending_partial_cdo {
            return Err(UserError::PartialUpdateNotAllowed(offending_partial_cdo).into());
        }

        // Transform the request into a Vec<NewVaultData>
        let (data, fingerprints) = request.decompose();
        let data = data
            .into_iter()
            .map(|(kind, pii)| {
                let e_data = self.vault().public_key.seal_pii(&pii)?;
                let p_data = kind.store_plaintext().then_some(pii);
                Ok(NewVaultData { kind, e_data, p_data })
            })
            .collect::<ApiResult<Vec<_>>>()?;

        let req = ValidatedDataRequest {
            data,
            fingerprints,
            new_cdos,
        };
        Ok(req)
    }
}

impl ValidatedDataRequest {
    /// Saves the validated updates to the DB
    pub(super) fn save(
        self,
        conn: &mut TxnPgConn,
        user_vault: &Vault,
        scoped_user_id: ScopedVaultId,
    ) -> ApiResult<Vec<VaultData>> {
        // Deactivate old VDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let overwrite_kinds = self
            .new_cdos
            .iter()
            .flat_map(|cdo| cdo.parent().options())
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default());
        let added_kinds = self.data.iter().map(|nvd| nvd.kind.clone());
        let kinds_to_deactivate = added_kinds
            // Even if we're not providing all fields for a CDO, deactivate old versions of all
            // fields in the CDO. For example, address line 2
            .chain(overwrite_kinds)
            .unique()
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_speculative(conn, &scoped_user_id, kinds_to_deactivate, seqno)?;

        // Create the new VDs
        let vds = VaultData::bulk_create(conn, &user_vault.id, &scoped_user_id, self.data, seqno)?;

        // Point fingerprints to the same lifetime used for the corresponding VD row
        let fingerprints: Vec<_> = self
            .fingerprints
            .into_iter()
            .map(
                |FingerprintRequest {
                     kind,
                     fingerprint,
                     scope,
                 }|
                 -> ApiResult<_> {
                    let vd = vds
                        .iter()
                        .find(|vd| vd.kind == kind)
                        .ok_or(AssertionError("No lifetime id found"))?;

                    Ok(NewFingerprint {
                        kind: kind.clone(),
                        sh_data: fingerprint,
                        lifetime_id: vd.lifetime_id.clone(),
                        // Don't make sandbox fingerprints unique since one phone number can be used
                        // to make multiple sandbox vaults.
                        is_unique: user_vault.is_live
                            && scope == FingerprintScopeKind::Global
                            && kind.globally_unique(),
                        scope,
                        version: newtypes::FingerprintVersion::current(),
                    })
                },
            )
            .collect::<ApiResult<_>>()?;

        Fingerprint::bulk_create(conn, fingerprints)?;

        Ok(vds)
    }
}
