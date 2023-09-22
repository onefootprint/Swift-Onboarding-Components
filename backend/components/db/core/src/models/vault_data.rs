use crate::DbError;
use crate::DbResult;
use crate::HasLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use crate::VaultedData;
use chrono::{DateTime, Utc};
use db_schema::schema::vault_data;
use diesel::prelude::*;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::StorageType;
use newtypes::VaultDataFormat;
use newtypes::VaultId;
use newtypes::{DataLifetimeId, VdId};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = vault_data)]
pub struct VaultData {
    pub id: VdId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
    pub kind: DataIdentifier,
    /// Encrypted pii data
    pub e_data: SealedVaultBytes,
    /// Plaintext data, only stored for certain data types
    pub p_data: Option<PiiString>,
    /// Whether the encrypted data is stored as a plaintext string or a serialized JSON value
    pub format: VaultDataFormat,
}

pub struct NewVaultData {
    pub kind: DataIdentifier,
    pub e_data: SealedVaultBytes,
    pub p_data: Option<PiiString>,
    pub format: VaultDataFormat,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_data)]
pub struct NewVaultDataRow {
    pub lifetime_id: DataLifetimeId,
    pub kind: DataIdentifier,
    pub e_data: SealedVaultBytes,
    pub p_data: Option<PiiString>,
    pub format: VaultDataFormat,
}

impl VaultData {
    #[tracing::instrument("VaultData::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        user_vault_id: &VaultId,
        scoped_user_id: &ScopedVaultId,
        data: Vec<NewVaultData>,
        seqno: DataLifetimeSeqno,
        source: DataLifetimeSource,
    ) -> DbResult<Vec<Self>> {
        // One more sanity check that we don't store plaintext data where not desired
        if let Some(d) = data
            .iter()
            .find(|d| d.kind.store_plaintext() != d.p_data.is_some())
        {
            return Err(DbError::ValidationError(format!(
                "Invalid {} in plaintext",
                d.kind
            )));
        }
        // And a sanity check that all the data we are storing should be in the vault data table
        if let Some(d) = data
            .iter()
            .find(|d| d.kind.storage_type() != StorageType::VaultData)
        {
            return Err(DbError::ValidationError(format!(
                "Cannot store {} as VaultData",
                d.kind
            )));
        }
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let lifetimes = DataLifetime::bulk_create(
            conn,
            user_vault_id,
            scoped_user_id,
            data.iter().map(|d| d.kind.clone()).collect(),
            seqno,
            source,
        )?;
        let new_rows: Vec<_> = data
            .into_iter()
            .zip(lifetimes.into_iter())
            .map(|(new_vd, lifetime)| NewVaultDataRow {
                lifetime_id: lifetime.id,
                kind: new_vd.kind,
                e_data: new_vd.e_data,
                p_data: new_vd.p_data,
                format: new_vd.format,
            })
            .collect();
        let results = diesel::insert_into(vault_data::table)
            .values(new_rows)
            .get_results(conn.conn())?;
        Ok(results)
    }

    #[tracing::instrument("VaultData::bulk_get_by_id", skip_all)]
    pub fn bulk_get_by_id(conn: &mut PgConn, ids: &[VdId]) -> DbResult<Vec<Self>> {
        Ok(vault_data::table
            .filter(vault_data::id.eq_any(ids))
            .get_results(conn)?)
    }
}

impl HasLifetime for VaultData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    #[tracing::instrument("VaultData::get_for", skip_all)]
    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = vault_data::table
            .filter(vault_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }

    fn data(&self) -> VaultedData {
        if let Some(p_data) = self.p_data.as_ref() {
            VaultedData::NonPrivate(p_data)
        } else {
            VaultedData::Sealed(&self.e_data)
        }
    }
}
