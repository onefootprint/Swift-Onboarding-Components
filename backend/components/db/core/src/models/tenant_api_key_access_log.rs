use std::collections::HashMap;

use crate::DbError;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_api_key_access_log;
use diesel::dsl::max;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{TenantApiKeyAccessLogId, TenantApiKeyId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_key_access_log)]
pub struct TenantApiKeyAccessLog {
    pub id: TenantApiKeyAccessLogId,
    pub tenant_api_key_id: TenantApiKeyId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_key_access_log)]
struct NewTenantApiKeyAccessLog {
    tenant_api_key_id: TenantApiKeyId,
    timestamp: DateTime<Utc>,
}

impl TenantApiKeyAccessLog {
    #[tracing::instrument("TenantApiKeyAccessLog::create", skip_all)]
    pub fn create(conn: &mut PgConn, tenant_api_key_id: TenantApiKeyId) -> Result<(), DbError> {
        let access_log = NewTenantApiKeyAccessLog {
            tenant_api_key_id,
            timestamp: Utc::now(),
        };
        diesel::insert_into(tenant_api_key_access_log::table)
            .values(access_log)
            .get_result::<TenantApiKeyAccessLog>(conn)?;
        Ok(())
    }

    #[tracing::instrument("TenantApiKeyAccessLog::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        tenant_api_key_ids: Vec<&TenantApiKeyId>,
    ) -> Result<HashMap<TenantApiKeyId, DateTime<Utc>>, DbError> {
        let results: HashMap<TenantApiKeyId, DateTime<Utc>> = tenant_api_key_access_log::table
            .filter(tenant_api_key_access_log::tenant_api_key_id.eq_any(tenant_api_key_ids))
            .group_by(tenant_api_key_access_log::tenant_api_key_id)
            .select((
                tenant_api_key_access_log::tenant_api_key_id,
                max(tenant_api_key_access_log::timestamp),
            ))
            .load::<(TenantApiKeyId, Option<DateTime<Utc>>)>(conn)?
            .into_iter()
            .filter_map(|x| x.1.map(|timestamp| (x.0, timestamp)))
            .collect();
        Ok(results)
    }
}
