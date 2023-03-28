use std::collections::HashSet;

use crate::{
    errors::{user::UserError, ApiError, ApiResult},
    utils::{vault_wrapper::VaultWrapper},
};
use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        vault_data::{NewVaultData, VaultData}, tenant::Tenant, vault::Vault
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    CollectedDataOption, DataLifetimeKind,
    ScopedVaultId, IdentityDataKind as IDK, DataRequest, DataIdentifier, Fingerprints,
};

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest{
    data: Vec<NewVaultData>,
    fingerprints: Fingerprints,
    new_cdos: HashSet<CollectedDataOption>
}

impl<Type> VaultWrapper<Type> {
    /// Given a DataRequest, validate some invariants before allowing it to be written to the vault.
    /// These invariants are also a function of the data in the vault at the time
    pub fn validate_request(&self, request: DataRequest<Fingerprints>) -> ApiResult<ValidatedDataRequest> {
        // Don't allow replacing a committed phone/email yet
        let irreplaceable_idks = vec![IDK::PhoneNumber, IDK::Email];
        for idk in irreplaceable_idks {
            let update_has_idk = request.keys().any(|id| id == &DataIdentifier::from(idk));
            let vault_already_has_idk = self.portable.get(idk).is_some();
            if update_has_idk && vault_already_has_idk {
                // We don't currently support adding a phone/email
                return Err(UserError::CannotReplaceData(idk.into()).into());
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
        let data = data.into_iter().map(|(kind, pii)| {
            let e_data = self.vault().public_key.seal_pii(&pii)?;
            let kind = kind.try_into().map_err(newtypes::Error::from)?;
            Ok(NewVaultData { kind, e_data })
        }).collect::<ApiResult<Vec<_>>>()?;

        let req = ValidatedDataRequest{data, fingerprints, new_cdos};
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
        let overwrite_kinds = self.new_cdos.iter().flat_map(|cdo| cdo.data_identifiers().unwrap_or_default().into_iter().filter_map(|di| DataLifetimeKind::try_from(di).ok()));
        let added_kinds = self.data.iter().map(|nvd| DataLifetimeKind::from(nvd.kind.clone()));
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
        let fingerprints: Vec<_> = self.fingerprints
            .into_iter()
            .map(|(kind, sh_data)| -> ApiResult<_> {
                Ok(NewFingerprint {
                    kind: kind.clone(),
                    sh_data,
                    lifetime_id: vds
                        .iter()
                        .find(|vd| DataLifetimeKind::from(vd.kind.clone()) == kind)
                        .map(|vd| vd.lifetime_id.clone())
                        .ok_or_else(|| ApiError::AssertionError("No lifetime id found".to_owned()))?,
                    is_unique: false,
                })
            })
            .collect::<ApiResult<_>>()?;
        let duplicates = Fingerprint::bulk_create(conn, fingerprints)?;
        
        // we don't ? here since if there's errors, we don't need to fail the txn, this is just for logs
        let tenant = Tenant::get(conn, &scoped_user_id);
        if let Ok(t) = tenant {
            duplicates.into_iter().filter(|(kind, count)| {
                *count > 1 && 
                // not all DLKs we 1) fingerprint and 2) we expect to be unique
                    match kind {
                        DataLifetimeKind::Id(k) => k.should_have_unique_fingerprint(),
                        _ => false
                    }
                }
            ).for_each(|(kind, count)| {
                // don't error if this is a demo tenant or sandbox user
                if user_vault.is_live && !t.is_demo_tenant {
                    tracing::error!(kind=%kind, count=%count, "same fingerprints used across distinct UserVaults")
                }
            });
        }         

        Ok(vds)
    }
}
