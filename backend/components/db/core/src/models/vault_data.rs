use super::data_lifetime::DataLifetime;
use super::data_lifetime::DataLifetimeSeqnoTxn;
use super::data_lifetime::NewDataLifetimeArgs;
use crate::errors::AssertionError;
use crate::DbError;
use crate::DbResult;
use crate::HasLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use crate::VaultedData;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::vault_data;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSource;
use newtypes::DbActor;
use newtypes::PiiString;
use newtypes::ScopedVaultVersionNumber;
use newtypes::SealedVaultBytes;
use newtypes::StorageType;
use newtypes::VaultDataFormat;
use newtypes::VdId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Eq, PartialEq, Hash)]
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

#[derive(Debug)]
pub struct NewVaultData {
    pub kind: DataIdentifier,
    pub e_data: SealedVaultBytes,
    pub p_data: Option<PiiString>,
    pub format: VaultDataFormat,
    pub origin_id: Option<DataLifetimeId>,
    pub source: DataLifetimeSource,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_data)]
struct NewVaultDataRow {
    lifetime_id: DataLifetimeId,
    kind: DataIdentifier,
    e_data: SealedVaultBytes,
    p_data: Option<PiiString>,
    format: VaultDataFormat,
}

impl VaultData {
    #[tracing::instrument("VaultData::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        sv_txn: &DataLifetimeSeqnoTxn<'_>,
        data: Vec<NewVaultData>,
        actor: Option<DbActor>,
    ) -> DbResult<(Vec<Self>, ScopedVaultVersionNumber)> {
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
        let dl_data = data
            .iter()
            .map(|d| NewDataLifetimeArgs {
                kind: d.kind.clone(),
                origin_id: d.origin_id.clone(),
                source: d.source,
            })
            .collect();
        let (dls, svv) = DataLifetime::bulk_create(conn, sv_txn, dl_data, actor)?;
        let mut dls: HashMap<_, _> = dls.into_iter().map(|dl| (dl.kind.clone(), dl)).collect();
        let new_rows: Vec<_> = data
            .into_iter()
            .map(|vd| -> DbResult<_> {
                let dl = dls.remove(&vd.kind).ok_or(AssertionError("No lifetime found"))?;
                Ok((vd, dl))
            })
            .map_ok(|(new_vd, lifetime)| NewVaultDataRow {
                lifetime_id: lifetime.id,
                kind: new_vd.kind,
                e_data: new_vd.e_data,
                p_data: new_vd.p_data,
                format: new_vd.format,
            })
            .collect::<DbResult<_>>()?;
        let results = diesel::insert_into(vault_data::table)
            .values(new_rows)
            .get_results(conn.conn())?;
        Ok((results, svv))
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
            VaultedData::NonPrivate(p_data, self.format)
        } else {
            VaultedData::Sealed(&self.e_data, self.format)
        }
    }
}
