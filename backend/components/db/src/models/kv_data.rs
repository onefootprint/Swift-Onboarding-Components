use crate::{schema::kv_data, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
use newtypes::{KeyValueDataId, KvDataKey, SealedVaultBytes, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Hash, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = kv_data)]
pub struct KeyValueData {
    pub id: KeyValueDataId,
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub data_key: KvDataKey,
    pub e_data: SealedVaultBytes,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = kv_data)]
struct NewKeyValueData {
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    data_key: KvDataKey,
    e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewKeyValueDataArgs {
    pub data_key: KvDataKey,
    pub e_data: SealedVaultBytes,
}

// TODO do we need to have `custom.` in the key?
impl KeyValueData {
    pub(crate) fn deactivate_bulk(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        data_keys: Vec<&KvDataKey>,
    ) -> Result<(), DbError> {
        let _ = diesel::update(kv_data::table)
            .filter(kv_data::user_vault_id.eq(user_vault_id))
            .filter(kv_data::tenant_id.eq(tenant_id))
            .filter(kv_data::data_key.eq_any(data_keys))
            .filter(kv_data::deactivated_at.is_null())
            .set(kv_data::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    pub fn get_all(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        data_keys: &[KvDataKey],
    ) -> Result<Vec<Self>, DbError> {
        Ok(kv_data::table
            .filter(kv_data::user_vault_id.eq(user_vault_id))
            .filter(kv_data::tenant_id.eq(tenant_id))
            .filter(kv_data::data_key.eq_any(data_keys))
            .filter(kv_data::deactivated_at.is_null())
            .get_results(conn)?)
    }

    pub fn update_or_insert(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        new_data: Vec<NewKeyValueDataArgs>,
    ) -> Result<(), DbError> {
        Self::deactivate_bulk(
            conn,
            user_vault_id.clone(),
            tenant_id.clone(),
            new_data.iter().map(|kvd| &kvd.data_key).collect(),
        )?;

        let new_data = new_data
            .into_iter()
            .map(|arg| {
                let NewKeyValueDataArgs { data_key, e_data } = arg;
                NewKeyValueData {
                    user_vault_id: user_vault_id.clone(),
                    tenant_id: tenant_id.clone(),
                    data_key,
                    e_data,
                }
            })
            .collect::<Vec<NewKeyValueData>>();

        diesel::insert_into(kv_data::table)
            .values(&new_data)
            .execute(conn)?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use crate::test::{test_db_conn, test_tenant, test_user_vault};

    #[test]
    fn test_update_or_insert() {
        let mut conn = test_db_conn();
        let user_vault = test_user_vault(&mut conn, true);
        let tenant = test_tenant(&mut conn);

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

        KeyValueData::update_or_insert(&mut conn, user_vault.id.clone(), tenant.id.clone(), vec![value1])
            .unwrap();
        let result1 = KeyValueData::get_all(&mut conn, user_vault.id.clone(), tenant.id.clone(), &data_keys)
            .expect("failed to get data 1");
        assert_eq!(result1.first().unwrap().e_data, e_data1);

        KeyValueData::update_or_insert(&mut conn, user_vault.id.clone(), tenant.id.clone(), vec![value2])
            .unwrap();
        let result2 = KeyValueData::get_all(&mut conn, user_vault.id, tenant.id, &data_keys)
            .expect("failed to get data 2");
        assert_eq!(result2.first().unwrap().e_data, e_data2);
    }
}
