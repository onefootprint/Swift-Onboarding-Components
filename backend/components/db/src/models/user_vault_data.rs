use crate::schema::user_vault_data;
use crate::DbResult;
use crate::HasLifetime;
use crate::HasSealedIdentityData;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::DataLifetimeKind;
use newtypes::DataLifetimeSeqno;
use newtypes::IdentityDataKind;
use newtypes::PersonVaultDataKind;
use newtypes::ScopedUserId;
use newtypes::SealedVaultBytes;
use newtypes::UserVaultId;
use newtypes::UvdKind;
use newtypes::{DataLifetimeId, UvdId};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_vault_data)]
pub struct UserVaultData {
    pub id: UvdId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
    pub kind: UvdKind,
    pub e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault_data)]
pub struct NewUserVaultData {
    pub kind: PersonVaultDataKind,
    pub e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault_data)]
pub struct NewUserVaultDataRow {
    pub lifetime_id: DataLifetimeId,
    pub kind: UvdKind,
    pub e_data: SealedVaultBytes,
}

impl UserVaultData {
    #[tracing::instrument(skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        user_vault_id: &UserVaultId,
        scoped_user_id: Option<&ScopedUserId>,
        data: Vec<NewUserVaultData>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let lifetimes = DataLifetime::bulk_create(
            conn,
            user_vault_id,
            scoped_user_id,
            data.iter()
                .map(|d| DataLifetimeKind::from(IdentityDataKind::from(d.kind)))
                .collect(),
            seqno,
        )?;
        let new_rows: Vec<_> = data
            .into_iter()
            .zip(lifetimes.into_iter())
            .map(|(new_uvd, lifetime)| NewUserVaultDataRow {
                lifetime_id: lifetime.id,
                kind: new_uvd.kind.into(),
                e_data: new_uvd.e_data,
            })
            .collect();
        let results = diesel::insert_into(user_vault_data::table)
            .values(new_rows)
            .get_results(conn.conn())?;
        Ok(results)
    }
}

impl HasLifetime for UserVaultData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = user_vault_data::table
            .filter(user_vault_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}

impl HasSealedIdentityData for UserVaultData {
    fn e_data(&self) -> &SealedVaultBytes {
        &self.e_data
    }
}
