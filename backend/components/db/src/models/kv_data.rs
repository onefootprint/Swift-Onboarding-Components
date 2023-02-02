use crate::{schema::kv_data, DbError};
use crate::{DbResult, HasLifetime, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use crate::PgConnection;
use diesel::{Insertable, Queryable, RunQueryDsl};
use newtypes::{
    DataLifetimeId, DataLifetimeKind, DataLifetimeSeqno, KeyValueDataId, KvDataKey, ScopedUserId,
    SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Hash, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = kv_data)]
pub struct KeyValueData {
    pub id: KeyValueDataId,
    pub data_key: KvDataKey,
    pub e_data: SealedVaultBytes,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = kv_data)]
struct NewKeyValueData {
    lifetime_id: DataLifetimeId,
    data_key: KvDataKey,
    e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewKeyValueDataArgs {
    pub data_key: KvDataKey,
    pub e_data: SealedVaultBytes,
}

impl KeyValueData {
    pub fn bulk_create(
        conn: &mut TxnPgConnection,
        user_vault_id: &UserVaultId,
        scoped_user_id: &ScopedUserId,
        data: Vec<NewKeyValueDataArgs>,
        seqno: DataLifetimeSeqno,
    ) -> Result<(), DbError> {
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let dlks = data
            .iter()
            .map(|a| a.data_key.clone())
            .map(DataLifetimeKind::from)
            .collect();
        let lifetimes = DataLifetime::bulk_create(conn, user_vault_id, Some(scoped_user_id), dlks, seqno)?;
        let new_rows = data
            .into_iter()
            .zip(lifetimes)
            .map(|(arg, lifetime)| {
                let NewKeyValueDataArgs { data_key, e_data } = arg;
                NewKeyValueData {
                    lifetime_id: lifetime.id,
                    data_key,
                    e_data,
                }
            })
            .collect::<Vec<NewKeyValueData>>();
        diesel::insert_into(kv_data::table)
            .values(&new_rows)
            .execute(conn.conn())?;
        Ok(())
    }
}

impl HasLifetime for KeyValueData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConnection, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>> {
        let results = kv_data::table
            .filter(kv_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}
