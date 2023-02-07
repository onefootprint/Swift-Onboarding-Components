use crate::{
    errors::{user::UserError, ApiError, ApiResult},
    utils::fingerprint::FingerprintMap,
};
use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        user_vault_data::{NewUserVaultData, UserVaultData},
    },
    TxnPgConn,
};
use either::Either::{Left, Right};
use itertools::Itertools;
use newtypes::{
    CollectedDataOption, DataLifetimeKind, IdentityDataKind, IdentityDataUpdate, PiiString, ScopedUserId,
    UserVaultId, UvdKind, VaultPublicKey,
};
use std::collections::HashMap;

/// Helps to process updates for data in an IdentityDataUpdate request.
pub struct UvdBuilder {
    data: Vec<NewUserVaultData>,
}

impl UvdBuilder {
    /// Construct the list of NewUserVaultData from an IdentityDataUpdate
    pub fn build(update: IdentityDataUpdate, vault_public_key: VaultPublicKey) -> ApiResult<Self> {
        let mut data = vec![];

        let mut add_sealed = |pii: PiiString, kind: UvdKind| -> ApiResult<()> {
            let sealed = vault_public_key.seal_pii(&pii)?;
            data.push(NewUserVaultData { kind, e_data: sealed });
            Ok(())
        };

        let (update, invalid_fields): (Vec<_>, Vec<_>) =
            update.into_inner().into_iter().partition_map(|(kind, pii)| {
                if let Some(kind) = kind.uvd_kind() {
                    Left((kind, pii))
                } else {
                    Right(kind)
                }
            });
        if !invalid_fields.is_empty() {
            return Err(UserError::InvalidDataKind(invalid_fields.into_iter().join(", ")).into());
        }

        for (kind, pii) in update {
            add_sealed(pii, kind)?;
        }

        Ok(Self { data })
    }

    /// Validates that the pending updates are valid and then saves them to the DB as speculative data
    pub fn validate_and_save(
        self,
        conn: &mut TxnPgConn,
        existing_fields: Vec<IdentityDataKind>, // portable or speculative on UVW
        user_vault_id: UserVaultId,
        scoped_user_id: ScopedUserId,
        fingerprints: FingerprintMap,
    ) -> ApiResult<Vec<CollectedDataOption>> {
        // First, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let new_fields = self.data.iter().map(|d| d.kind.into()).collect();
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

        // Deactivate old UVDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let kinds_to_deactivate = new
            .iter()
            .flat_map(|cdo| cdo.attributes())
            .map(DataLifetimeKind::from)
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_speculative(conn, &scoped_user_id, kinds_to_deactivate, seqno)?;

        // Create the new UVDs
        let uvds = UserVaultData::bulk_create(conn, &user_vault_id, Some(&scoped_user_id), self.data, seqno)?;

        // Point fingerprints to the same lifetime used for the corresponding UVD row
        let kind_to_lifetime: HashMap<IdentityDataKind, _> =
            HashMap::from_iter(uvds.into_iter().map(|uvd| (uvd.kind.into(), uvd.lifetime_id)));
        let fingerprints: Vec<_> = fingerprints
            .into_iter()
            .map(|(kind, sh_data)| -> ApiResult<_> {
                Ok(NewFingerprint {
                    kind: kind.into(),
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
        Ok(new.into_iter().collect())
    }
}
