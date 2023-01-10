use crate::TxnPgConnection;
use crate::{schema::kv_data, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
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
    pub fn get_all(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
        data_keys: &[KvDataKey],
    ) -> Result<Vec<Self>, DbError> {
        // TODO don't use this custom method anymore, go through UVW
        use crate::schema::data_lifetime;
        let lifetime_ids = data_lifetime::table
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .filter(data_lifetime::deactivated_at.is_null())
            .select(data_lifetime::id);
        Ok(kv_data::table
            .filter(kv_data::lifetime_id.eq_any(lifetime_ids))
            .filter(kv_data::data_key.eq_any(data_keys))
            .get_results(conn)?)
    }

    pub fn bulk_create(
        conn: &mut TxnPgConnection,
        user_vault_id: &UserVaultId,
        scoped_user_id: &ScopedUserId,
        data: Vec<NewKeyValueDataArgs>,
        seqno: DataLifetimeSeqno,
    ) -> Result<(), DbError> {
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let lifetimes = DataLifetime::bulk_create(
            conn,
            user_vault_id,
            Some(scoped_user_id),
            // TODO do we want to denormalize the key onto the DataLifetimeKind?
            data.iter().map(|_| DataLifetimeKind::Custom).collect(),
            seqno,
        )?;
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

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use macros::db_test;

    #[db_test]
    fn test_update_or_insert(conn: &mut TestPgConnection) {
        let user_vault = fixtures::user_vault::create(conn).into_inner();
        let tenant = fixtures::tenant::create(conn);
        let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
        let su = fixtures::scoped_user::create(conn, &user_vault.id, &ob_config.id);

        let data_key = KvDataKey::from_str("custom.test1").unwrap();
        let data_keys = vec![data_key.clone()];
        let e_data1 = SealedVaultBytes(vec![0x01, 0x02, 0x03]);
        let e_data2 = SealedVaultBytes(vec![0x04, 0x05, 0x06]);

        let value1 = NewKeyValueDataArgs {
            data_key: data_key.clone(),
            e_data: e_data1.clone(),
        };

        let value2 = NewKeyValueDataArgs {
            data_key,
            e_data: e_data2.clone(),
        };

        // Insert the value
        let seqno = DataLifetime::get_next_seqno(conn).unwrap();
        KeyValueData::bulk_create(conn, &user_vault.id, &su.id, vec![value1], seqno).unwrap();
        let result1 = KeyValueData::get_all(conn, &su.id, &data_keys).expect("failed to get data 1");
        let result1 = result1.into_iter().next().unwrap();
        assert_eq!(result1.e_data, e_data1);

        // Update the value
        let seqno = DataLifetime::get_next_seqno(conn).unwrap();
        DataLifetime::bulk_deactivate(conn, vec![result1.lifetime_id], seqno).unwrap();
        KeyValueData::bulk_create(conn, &user_vault.id, &su.id, vec![value2], seqno).unwrap();
        let result2 = KeyValueData::get_all(conn, &su.id, &data_keys).expect("failed to get data 2");
        assert_eq!(result2.into_iter().next().unwrap().e_data, e_data2);
    }
}
