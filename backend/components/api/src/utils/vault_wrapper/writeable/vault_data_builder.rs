use crate::{
    errors::{user::UserError, ApiError, ApiResult},
    utils::fingerprint::NewFingerprints,
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
    CollectedDataOption, DataIdentifier, DataLifetimeKind, DataRequest,
    ScopedVaultId, VaultId, VaultPublicKey, IdentityDataKind as IDK, DataValidationError,
};

/// Helps to process updates for data in a DataRequest<T>.
pub struct VaultDataBuilder {
    data: Vec<NewVaultData>,
}


impl VaultDataBuilder {
    /// Construct the list of NewVaultData from a DataRequest<T>
    pub fn build(update: DataRequest, vault_public_key: VaultPublicKey) -> ApiResult<Self> {
        let mut data = vec![];
        for (kind, pii) in update.into_inner() {
            let sealed = vault_public_key.seal_pii(&pii)?;
            data.push(NewVaultData { kind: kind.try_into().map_err(newtypes::Error::from)?, e_data: sealed });
        }

        Ok(Self { data })
    }

    /// Validates that the pending updates are valid and then saves them to the DB as speculative data
    pub fn validate_and_save(
        self,
        conn: &mut TxnPgConn,
        existing_fields: Vec<DataIdentifier>, // portable or speculative on UVW
        user_vault_id: VaultId,
        scoped_user_id: ScopedVaultId,
        fingerprints: NewFingerprints<IDK>, // should eventually support more than just IDK fingerprints
    ) -> ApiResult<Vec<VaultData>> {
        let new_dis = self.data.iter().map(|d| DataIdentifier::from(d.kind.clone())).collect_vec();

        // First, validate that there are no "dangling" extra keys after we apply the write to the
        // user vault.
        // This allows us to only update, say, id.first_name as long as the vault already has id.last_name
        let full_dis = existing_fields.iter().chain(new_dis.iter()).cloned().collect();
        let dangling_keys_after_write = CollectedDataOption::dangling_identifiers(full_dis);
        if !dangling_keys_after_write.is_empty() {
            return Err(newtypes::Error::from(DataValidationError::ExtraFieldError(dangling_keys_after_write)).into());
        }

        // Next, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let existing_cdos = CollectedDataOption::list_from(existing_fields);
        let new_cdos = CollectedDataOption::list_from(new_dis);
        let offending_partial_cdo =
            new_cdos.iter()
                .cloned()
                .find(|speculative_cdo| match speculative_cdo.full_variant() {
                    Some(full_cdo) => existing_cdos.contains(&full_cdo),
                    None => false,
                });
        if let Some(offending_partial_cdo) = offending_partial_cdo {
            return Err(UserError::PartialUpdateNotAllowed(offending_partial_cdo).into());
        }

        // Deactivate old VDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let overwrite_kinds = new_cdos.iter().flat_map(|cdo| cdo.data_identifiers().unwrap_or_default().into_iter().filter_map(|di| DataLifetimeKind::try_from(di).ok()));
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
        let vds = VaultData::bulk_create(conn, &user_vault_id, &scoped_user_id, self.data, seqno)?;

        // Point fingerprints to the same lifetime used for the corresponding VD row
        let fingerprints: Vec<_> = fingerprints
            .into_iter()
            .map(|(idk, sh_data)| -> ApiResult<_> {
                Ok(NewFingerprint {
                    kind: DataLifetimeKind::from(idk),
                    sh_data,
                    lifetime_id: vds
                        .iter()
                        .find(|vd| vd.kind == idk.into())
                        .map(|vd| vd.lifetime_id.clone())
                        .ok_or_else(|| ApiError::AssertionError("No lifetime id found".to_owned()))?,
                    is_unique: false,
                })
            })
            .collect::<ApiResult<_>>()?;
        let duplicates = Fingerprint::bulk_create(conn, fingerprints)?;
        
        // we don't ? here since if there's errors, we don't need to fail the txn, this is just for logs
        let tenant = Tenant::get(conn, &scoped_user_id);
        let user_vault = Vault::get(conn, &user_vault_id);

        if let (Ok(t), Ok(uv)) = (tenant, user_vault) {
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
                if uv.is_live && !t.is_demo_tenant {
                    tracing::error!(kind=%kind, count=%count, "same fingerprints used across distinct UserVaults")
                }
            });
        }         

        Ok(vds)
    }
}
