use crate::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use crate::schema::tenant_api_keys::BoxedQuery;
use crate::{schema::tenant_api_keys, DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{ApiKeyStatus, Fingerprint, SealedVaultBytes, TenantApiKeyId, TenantId};
use serde::{Deserialize, Serialize};

use super::tenants::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
    pub status: ApiKeyStatus,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_api_keys)]
struct TenantApiKeyUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[derive(Debug, Clone)]
pub struct ApiKeyListQuery {
    pub tenant_id: TenantId,
    pub is_live: bool,
}

impl TenantApiKey {
    fn list_query(query: &ApiKeyListQuery) -> BoxedQuery<Pg> {
        tenant_api_keys::table
            .filter(tenant_api_keys::tenant_id.eq(&query.tenant_id))
            .filter(tenant_api_keys::is_live.eq(query.is_live))
            .into_boxed()
    }

    pub fn list(
        conn: &mut PgConnection,
        query: &ApiKeyListQuery,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> Result<Vec<TenantApiKey>, DbError> {
        let mut query = Self::list_query(query)
            .order_by(tenant_api_keys::created_at.desc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_api_keys::created_at.le(cursor))
        }

        let results = query.load::<TenantApiKey>(conn)?;
        Ok(results)
    }

    pub fn count(conn: &mut PgConnection, query: &ApiKeyListQuery) -> Result<i64, DbError> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    pub fn get(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        id: &TenantApiKeyId,
        is_live: bool,
    ) -> Result<TenantApiKey, DbError> {
        let result = tenant_api_keys::table
            .filter(tenant_api_keys::tenant_id.eq(tenant_id))
            .filter(tenant_api_keys::id.eq(id))
            .filter(tenant_api_keys::is_live.eq(is_live))
            .first(conn)?;
        Ok(result)
    }

    pub fn get_enabled(
        conn: &mut PgConnection,
        sh_api_key: Fingerprint,
    ) -> Result<Option<(TenantApiKey, Tenant)>, DbError> {
        use crate::schema::tenants;
        let result: Option<(TenantApiKey, Tenant)> = tenant_api_keys::table
            .inner_join(tenants::table)
            .filter(tenant_api_keys::sh_secret_api_key.eq(sh_api_key))
            .first(conn)
            .optional()?;
        if let Some((api_key, _)) = &result {
            if api_key.status != ApiKeyStatus::Enabled {
                return Err(DbError::ApiKeyDisabled);
            }
            TenantApiKeyAccessLog::create(conn, api_key.id.clone())?;
        }
        Ok(result)
    }

    pub async fn create(
        pool: &DbPool,
        name: String,
        sh_secret_api_key: Fingerprint,
        e_secret_api_key: SealedVaultBytes,
        tenant_id: TenantId,
        is_live: bool,
    ) -> Result<TenantApiKey, DbError> {
        let new_key = NewTenantApiKey {
            name,
            sh_secret_api_key,
            e_secret_api_key,
            tenant_id,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
        };
        let tenant_api_key = pool
            .db_query(move |conn| {
                diesel::insert_into(tenant_api_keys::table)
                    .values(new_key)
                    .get_result::<TenantApiKey>(conn)
            })
            .await??;

        Ok(tenant_api_key)
    }

    pub fn update(
        conn: &mut PgConnection,
        id: TenantApiKeyId,
        tenant_id: TenantId,
        is_live: bool,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
    ) -> Result<Self, DbError> {
        let update = TenantApiKeyUpdate { name, status };
        let results: Vec<Self> = diesel::update(tenant_api_keys::table)
            .filter(tenant_api_keys::id.eq(id))
            .filter(tenant_api_keys::tenant_id.eq(tenant_id))
            .filter(tenant_api_keys::is_live.eq(is_live))
            .set(update)
            .load(conn)?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
struct NewTenantApiKey {
    name: String,
    sh_secret_api_key: Fingerprint,
    e_secret_api_key: SealedVaultBytes,
    tenant_id: TenantId,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,
}
