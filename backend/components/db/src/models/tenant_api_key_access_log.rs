use std::collections::HashMap;

use crate::{schema::tenant_api_key_access_logs, DbError};
use chrono::{DateTime, Utc};
use diesel::dsl::max;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{TenantApiKeyId, Uuid};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_key_access_logs)]
pub struct TenantApiKeyAccessLog {
    pub id: Uuid,
    pub tenant_api_key_id: TenantApiKeyId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_key_access_logs)]
struct NewTenantApiKeyAccessLog {
    tenant_api_key_id: TenantApiKeyId,
    timestamp: DateTime<Utc>,
}

impl TenantApiKeyAccessLog {
    pub fn create(conn: &mut PgConnection, tenant_api_key_id: TenantApiKeyId) -> Result<(), DbError> {
        let access_log = NewTenantApiKeyAccessLog {
            tenant_api_key_id,
            timestamp: Utc::now(),
        };
        diesel::insert_into(tenant_api_key_access_logs::table)
            .values(access_log)
            .get_result::<TenantApiKeyAccessLog>(conn)?;
        Ok(())
    }

    pub fn get(
        conn: &mut PgConnection,
        tenant_api_key_ids: Vec<&TenantApiKeyId>,
    ) -> Result<HashMap<TenantApiKeyId, DateTime<Utc>>, DbError> {
        let results: HashMap<TenantApiKeyId, DateTime<Utc>> = tenant_api_key_access_logs::table
            .filter(tenant_api_key_access_logs::tenant_api_key_id.eq_any(tenant_api_key_ids))
            .group_by(tenant_api_key_access_logs::tenant_api_key_id)
            .select((
                tenant_api_key_access_logs::tenant_api_key_id,
                max(tenant_api_key_access_logs::timestamp),
            ))
            .load::<(TenantApiKeyId, Option<DateTime<Utc>>)>(conn)?
            .into_iter()
            .filter_map(|x| x.1.map(|timestamp| (x.0, timestamp)))
            .collect();
        Ok(results)
    }
}
