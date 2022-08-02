use crate::{schema::tenant_api_key_access_logs, DbError};
use chrono::{DateTime, Utc};
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
}
