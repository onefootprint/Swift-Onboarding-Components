use crate::schema::vault_data;
use crate::DbError;
use crate::DbResult;
use crate::HasLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeKind;
use newtypes::DataLifetimeSeqno;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultId;
use newtypes::VdKind;
use newtypes::{DataLifetimeId, VdId};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = vault_data)]
pub struct VaultData {
    pub id: VdId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
    pub kind: VdKind,
    /// Encrypted pii data
    pub e_data: SealedVaultBytes,
    /// Plaintext data, only stored for certain data types
    pub p_data: Option<PiiString>,
}

pub struct NewVaultData {
    pub kind: VdKind,
    pub e_data: SealedVaultBytes,
    pub p_data: Option<PiiString>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = vault_data)]
pub struct NewUserVaultDataRow {
    pub lifetime_id: DataLifetimeId,
    pub kind: VdKind,
    pub e_data: SealedVaultBytes,
    pub p_data: Option<PiiString>,
}

impl VaultData {
    #[tracing::instrument(skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        user_vault_id: &VaultId,
        scoped_user_id: &ScopedVaultId,
        data: Vec<NewVaultData>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        // One more sanity check that we don't store plaintext data where not desired
        if let Some(d) = data
            .iter()
            .find(|d| DataIdentifier::from(d.kind.clone()).store_plaintext() != d.p_data.is_some())
        {
            return Err(DbError::ValidationError(format!(
                "Cannot store {} in plaintext",
                d.kind
            )));
        }
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let lifetimes = DataLifetime::bulk_create(
            conn,
            user_vault_id,
            scoped_user_id,
            data.iter()
                .map(|d| DataLifetimeKind::from(d.kind.clone()))
                .collect(),
            seqno,
        )?;
        let new_rows: Vec<_> = data
            .into_iter()
            .zip(lifetimes.into_iter())
            .map(|(new_vd, lifetime)| NewUserVaultDataRow {
                lifetime_id: lifetime.id,
                kind: new_vd.kind,
                e_data: new_vd.e_data,
                p_data: new_vd.p_data,
            })
            .collect();
        let results = diesel::insert_into(vault_data::table)
            .values(new_rows)
            .get_results(conn.conn())?;
        Ok(results)
    }
}

impl HasLifetime for VaultData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = vault_data::table
            .filter(vault_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}

impl VaultData {
    pub fn data(&self) -> VaultedData {
        if let Some(p_data) = self.p_data.as_ref() {
            VaultedData::NonPrivate(p_data)
        } else {
            VaultedData::Sealed(&self.e_data)
        }
    }
}

pub enum VaultedData<'a> {
    /// Data that is stored encrypted
    Sealed(&'a SealedVaultBytes),
    /// Data that is generally not considered private so is stored in plaintext in the DB
    NonPrivate(&'a PiiString),
}
