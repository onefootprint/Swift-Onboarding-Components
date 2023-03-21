use crate::schema::kv_data;
use crate::PgConn;
use crate::{DbResult, HasLifetime};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable, RunQueryDsl};
use newtypes::{DataLifetimeId, KeyValueDataId, KvDataKey, SealedVaultBytes};
use serde::{Deserialize, Serialize};

#[derive(Debug, Hash, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = kv_data)]
struct KeyValueData {
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
struct NewKeyValueDataArgs {
    pub data_key: KvDataKey,
    pub e_data: SealedVaultBytes,
}

impl HasLifetime for KeyValueData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>> {
        let results = kv_data::table
            .filter(kv_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}
