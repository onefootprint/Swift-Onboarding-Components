use crate::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use crate::schema::tenant_api_key;
use crate::schema::tenant_api_key::BoxedQuery;
use crate::{DbError, DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{ApiKeyStatus, Fingerprint, SealedVaultBytes, TenantApiKeyId, TenantId};

use super::ob_configuration::IsLive;
use super::tenant::Tenant;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = tenant_api_key)]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_api_key)]
pub struct NewTenantApiKey {
    pub name: String,
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_api_key)]
struct TenantApiKeyUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[derive(Debug, Clone)]
pub struct ApiKeyListQuery {
    pub tenant_id: TenantId,
    pub is_live: IsLive,
}

pub enum TenantApiKeyIdentifier<'a> {
    Id(&'a TenantApiKeyId, &'a TenantId, IsLive),
    /// Only used when creating an integration testing tenant
    Name(&'a str, &'a TenantId, IsLive),
}

impl<'a> From<(&'a TenantApiKeyId, &'a TenantId, IsLive)> for TenantApiKeyIdentifier<'a> {
    fn from((id, tenant_id, is_live): (&'a TenantApiKeyId, &'a TenantId, IsLive)) -> Self {
        Self::Id(id, tenant_id, is_live)
    }
}

impl<'a> From<(&'a str, &'a TenantId, IsLive)> for TenantApiKeyIdentifier<'a> {
    fn from((name, tenant_id, is_live): (&'a str, &'a TenantId, IsLive)) -> Self {
        Self::Name(name, tenant_id, is_live)
    }
}

impl TenantApiKey {
    fn list_query(query: &ApiKeyListQuery) -> BoxedQuery<Pg> {
        tenant_api_key::table
            .filter(tenant_api_key::tenant_id.eq(&query.tenant_id))
            .filter(tenant_api_key::is_live.eq(query.is_live))
            .into_boxed()
    }

    pub fn list(
        conn: &mut PgConnection,
        query: &ApiKeyListQuery,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<TenantApiKey>> {
        let mut query = Self::list_query(query)
            .order_by(tenant_api_key::created_at.desc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_api_key::created_at.le(cursor))
        }

        let results = query.load::<TenantApiKey>(conn)?;
        Ok(results)
    }

    pub fn count(conn: &mut PgConnection, query: &ApiKeyListQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    pub fn get<'a, T: Into<TenantApiKeyIdentifier<'a>>>(
        conn: &mut PgConnection,
        id: T,
    ) -> DbResult<TenantApiKey> {
        let mut query = tenant_api_key::table.into_boxed();
        match id.into() {
            TenantApiKeyIdentifier::Id(id, tenant_id, is_live) => {
                query = query
                    .filter(tenant_api_key::tenant_id.eq(tenant_id))
                    .filter(tenant_api_key::id.eq(id))
                    .filter(tenant_api_key::is_live.eq(is_live));
            }
            TenantApiKeyIdentifier::Name(name, tenant_id, is_live) => {
                query = query
                    .filter(tenant_api_key::tenant_id.eq(tenant_id))
                    .filter(tenant_api_key::name.eq(name))
                    .filter(tenant_api_key::is_live.eq(is_live));
            }
        }
        let result = query.first(conn)?;
        Ok(result)
    }

    pub fn get_enabled(
        conn: &mut PgConnection,
        sh_api_key: Fingerprint,
    ) -> DbResult<Option<(TenantApiKey, Tenant)>> {
        use crate::schema::tenant;
        let result: Option<(TenantApiKey, Tenant)> = tenant_api_key::table
            .inner_join(tenant::table)
            .filter(tenant_api_key::sh_secret_api_key.eq(sh_api_key))
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

    pub fn create(
        conn: &mut PgConnection,
        name: String,
        sh_secret_api_key: Fingerprint,
        e_secret_api_key: SealedVaultBytes,
        tenant_id: TenantId,
        is_live: IsLive,
    ) -> DbResult<TenantApiKey> {
        let new_key = NewTenantApiKey {
            name,
            sh_secret_api_key,
            e_secret_api_key,
            tenant_id,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
        };
        let tenant_api_key = diesel::insert_into(tenant_api_key::table)
            .values(new_key)
            .get_result::<TenantApiKey>(conn)?;

        Ok(tenant_api_key)
    }

    pub fn update(
        conn: &mut TxnPgConnection,
        id: TenantApiKeyId,
        tenant_id: TenantId,
        is_live: IsLive,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
    ) -> DbResult<Self> {
        let update = TenantApiKeyUpdate { name, status };
        let results: Vec<Self> = diesel::update(tenant_api_key::table)
            .filter(tenant_api_key::id.eq(id))
            .filter(tenant_api_key::tenant_id.eq(tenant_id))
            .filter(tenant_api_key::is_live.eq(is_live))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }
}
