use std::collections::HashMap;

use crate::{
    errors::{user::UserError, ApiError, ApiResult},
    utils::fingerprint::NewFingerprints,
};
use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        vault_data::{NewVaultData, VaultData},
    },
    TxnPgConn,
};
use newtypes::{
    CollectedDataOption, DataIdentifier, DataLifetimeKind, DataRequest, IsDataIdentifierDiscriminant,
    PiiString, ScopedVaultId, VaultId, VaultPublicKey, VdKind,
};

/// Helps to process updates for data in a DataRequest<T>.
pub struct VaultDataBuilder<T> {
    data: Vec<NewVaultData<T>>,
}

impl<T> VaultDataBuilder<T>
where
    T: IsDataIdentifierDiscriminant + Into<VdKind>,
    DataLifetimeKind: From<T>,
{
    /// Construct the list of NewVaultData from a DataRequest<T>
    pub fn build(update: DataRequest<T>, vault_public_key: VaultPublicKey) -> ApiResult<Self> {
        let mut data = vec![];

        let mut add_sealed = |pii: PiiString, kind: T| -> ApiResult<()> {
            let sealed = vault_public_key.seal_pii(&pii)?;
            data.push(NewVaultData::<T> { kind, e_data: sealed });
            Ok(())
        };
        for (kind, pii) in update.into_inner() {
            add_sealed(pii, kind)?;
        }

        Ok(Self { data })
    }

    /// Validates that the pending updates are valid and then saves them to the DB as speculative data
    pub fn validate_and_save(
        self,
        conn: &mut TxnPgConn,
        existing_fields: Vec<T>, // portable or speculative on UVW
        user_vault_id: VaultId,
        scoped_user_id: ScopedVaultId,
        fingerprints: NewFingerprints<T>,
    ) -> ApiResult<()> {
        // First, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let new_fields = self.data.iter().map(|d| d.kind.clone()).collect();
        let existing = CollectedDataOption::list_from(existing_fields);
        let new = CollectedDataOption::list_from(new_fields);
        let offending_partial_cdo =
            new.iter()
                .cloned()
                .find(|speculative_cdo| match speculative_cdo.full_variant() {
                    Some(full_cdo) => existing.contains(&full_cdo),
                    None => false,
                });
        if let Some(offending_partial_cdo) = offending_partial_cdo {
            return Err(UserError::PartialUpdateNotAllowed(offending_partial_cdo).into());
        }

        // Deactivate old VDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let kinds_to_deactivate = new
            .iter()
            .flat_map(|cdo| cdo.attributes::<T>())
            .map(DataLifetimeKind::from)
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_speculative(conn, &scoped_user_id, kinds_to_deactivate, seqno)?;

        // Create the new VDs
        let vds = VaultData::bulk_create(conn, &user_vault_id, Some(&scoped_user_id), self.data, seqno)?;

        // Point fingerprints to the same lifetime used for the corresponding VD row
        let kind_to_lifetime = vds
            .into_iter()
            .map(|vd| {
                T::try_from(DataIdentifier::from(vd.kind))
                    .map(|idk| (idk, vd.lifetime_id))
                    .map_err(|_| ApiError::AssertionError("Cannot convert from vd.kind to T".to_owned()))
            })
            .collect::<Result<HashMap<_, _>, ApiError>>()?;
        let fingerprints: Vec<_> = fingerprints
            .into_iter()
            .map(|(kind, sh_data)| -> ApiResult<_> {
                Ok(NewFingerprint {
                    kind: DataLifetimeKind::from(kind.clone()),
                    sh_data,
                    lifetime_id: kind_to_lifetime
                        .get(&kind)
                        .ok_or_else(|| ApiError::AssertionError("No lifetime id found".to_owned()))?
                        .clone(),
                    is_unique: false,
                })
            })
            .collect::<ApiResult<_>>()?;
        Fingerprint::bulk_create(conn, fingerprints)?;
        Ok(())
    }
}
