use crate::models::data_lifetime::DataLifetime;
use crate::DbError;
use crate::PgConn;
use api_errors::FpResult;
use itertools::Itertools;
use newtypes::DataLifetimeId;
use newtypes::PiiString;
use newtypes::S3Url;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;
use std::collections::HashMap;

const LIFETIME_ID_CHUNK_SIZE: usize = 50_000;

/// Defines common functionality required for pieces of data that belong to a user vault and
/// have an associated DataLifetime.
pub trait HasLifetime {
    /// Get the lifetime_id associated with this row.
    fn lifetime_id(&self) -> &DataLifetimeId;

    /// Get rows of this table associated with the provided lifetime IDs.
    /// Used where the lifetime IDs all belong to a single user vault.
    fn get_for(conn: &mut PgConn, lifetimes: &[DataLifetimeId]) -> FpResult<Vec<Self>>
    where
        Self: Sized;

    /// Get rows of this table associated with the provided lifetime IDs.
    /// Used where the lifetime IDs all belong to potentially multiple user vaults.
    fn bulk_get(conn: &mut PgConn, lifetimes: &[&DataLifetime]) -> FpResult<HashMap<VaultId, Vec<Self>>>
    where
        Self: Sized,
    {
        let lifetime_id_to_uv_id: HashMap<DataLifetimeId, VaultId> =
            HashMap::from_iter(lifetimes.iter().map(|l| (l.id.clone(), l.vault_id.clone())));

        // Use the existing util to fetch all the rows for these lifetimes.
        // Batch by chunks of 50k lifetime_ids at a time
        let lifetime_ids: Vec<_> = lifetimes.iter().map(|l| l.id.clone()).sorted().collect();
        let results = lifetime_ids
            .into_iter()
            .chunks(LIFETIME_ID_CHUNK_SIZE)
            .into_iter()
            .map(|l_ids| Self::get_for(conn, &l_ids.into_iter().collect_vec()))
            .collect::<FpResult<Vec<_>>>()?;
        let results = results.into_iter().flatten().collect_vec();

        // Organize the results by the uv_id to which each row belongs
        let uv_ids = results
            .iter()
            .map(|d| {
                lifetime_id_to_uv_id
                    .get(d.lifetime_id())
                    .cloned()
                    .ok_or(DbError::RelatedObjectNotFound.into())
            })
            .collect::<FpResult<Vec<_>>>()?;
        let results = uv_ids.into_iter().zip(results).into_group_map();
        Ok(results)
    }

    fn data(&self) -> VaultedData;
}

#[derive(Debug, Eq, PartialEq)]
pub enum VaultedData<'a> {
    /// Data that is stored encrypted
    Sealed(&'a SealedVaultBytes, VaultDataFormat),
    /// Larger data that is encrypted using an intermediate key. The encrypted data is stored in
    /// s3, and the intermediate key is encrypted to the user vault's key.
    LargeSealed(&'a S3Url, &'a newtypes::SealedVaultDataKey),
    /// Data that is generally not considered private so is stored in plaintext in the DB
    NonPrivate(&'a PiiString, VaultDataFormat),
}
