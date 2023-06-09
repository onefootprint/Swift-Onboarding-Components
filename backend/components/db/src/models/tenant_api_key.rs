use crate::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use crate::schema::tenant_api_key;
use crate::schema::tenant_api_key::BoxedQuery;
use crate::schema::tenant_role;
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{ApiKeyStatus, Fingerprint, SealedVaultBytes, TenantApiKeyId, TenantId, TenantRoleId};

use super::ob_configuration::IsLive;
use super::tenant::Tenant;
use super::tenant_role::{ImmutableRoleKind, TenantRole};

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
    pub role_id: TenantRoleId,
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
    pub role_id: TenantRoleId,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_api_key)]
struct TenantApiKeyUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
    role_id: Option<TenantRoleId>,
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

    #[tracing::instrument(skip_all)]
    pub fn list(
        conn: &mut PgConn,
        query: &ApiKeyListQuery,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<(TenantApiKey, TenantRole)>> {
        let mut query = Self::list_query(query)
            .inner_join(tenant_role::table)
            .select((tenant_api_key::all_columns, tenant_role::all_columns))
            .order_by(tenant_api_key::created_at.desc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_api_key::created_at.le(cursor))
        }

        let results = query.get_results::<(Self, TenantRole)>(conn)?;
        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn count(conn: &mut PgConn, query: &ApiKeyListQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument(skip_all)]
    pub fn get<'a, T: Into<TenantApiKeyIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
    ) -> DbResult<(TenantApiKey, TenantRole)> {
        let mut query = tenant_api_key::table.inner_join(tenant_role::table).into_boxed();
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

    #[tracing::instrument(skip_all)]
    pub fn get_enabled(
        conn: &mut PgConn,
        sh_api_key: Fingerprint,
    ) -> DbResult<(TenantApiKey, Tenant, TenantRole)> {
        use crate::schema::tenant;
        let (api_key, tenant, role): (TenantApiKey, Tenant, TenantRole) = tenant_api_key::table
            .inner_join(tenant::table)
            .inner_join(tenant_role::table)
            .filter(tenant_api_key::sh_secret_api_key.eq(sh_api_key))
            .first(conn)?;
        if api_key.status != ApiKeyStatus::Enabled {
            return Err(DbError::ApiKeyDisabled);
        }
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }
        if role.tenant_id != api_key.tenant_id {
            return Err(DbError::TenantRoleMismatch);
        }
        TenantApiKeyAccessLog::create(conn, api_key.id.clone())?;
        Ok((api_key, tenant, role))
    }

    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        name: String,
        sh_secret_api_key: Fingerprint,
        e_secret_api_key: SealedVaultBytes,
        tenant_id: TenantId,
        is_live: IsLive,
        role_id: Option<TenantRoleId>,
    ) -> DbResult<TenantApiKey> {
        // For now, while role_id is optional from the API, default to the admin role for backwards
        // compatibility
        // TODO make this not null
        let role_id = if let Some(role_id) = role_id {
            // Make sure the role we are using belongs to the tenant, otherwise could make api key
            // for another tenant's role
            TenantRole::lock_active(conn, &role_id, &tenant_id)?
                .into_inner()
                .id
        } else {
            TenantRole::get_or_create_immutable(conn, &tenant_id, ImmutableRoleKind::Admin)?.id
        };
        let new_key = NewTenantApiKey {
            name,
            sh_secret_api_key,
            e_secret_api_key,
            tenant_id,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            role_id,
        };
        let tenant_api_key = diesel::insert_into(tenant_api_key::table)
            .values(new_key)
            .get_result::<TenantApiKey>(conn.conn())?;

        Ok(tenant_api_key)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: TenantApiKeyId,
        tenant_id: TenantId,
        is_live: IsLive,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
        role_id: Option<TenantRoleId>,
    ) -> DbResult<Self> {
        let update = TenantApiKeyUpdate {
            name,
            status,
            role_id,
        };
        // TODO also lock the role if we change the status?
        if let Some(role_id) = update.role_id.as_ref() {
            // Lock the role to make sure we don't deactivate it before we update this rolebinding.
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            TenantRole::lock_active(conn, role_id, &tenant_id)?;
        }
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
