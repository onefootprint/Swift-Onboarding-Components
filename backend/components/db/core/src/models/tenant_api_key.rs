use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_api_key;
use db_schema::schema::tenant_api_key::BoxedQuery;
use db_schema::schema::tenant_role;
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
    pub last_used_at: Option<DateTime<Utc>>,
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
pub struct ApiKeyListFilters {
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub role_ids: Option<Vec<TenantRoleId>>,
    pub status: Option<ApiKeyStatus>,
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
    fn list_query(filters: &ApiKeyListFilters) -> BoxedQuery<Pg> {
        let mut query = tenant_api_key::table
            .filter(tenant_api_key::tenant_id.eq(&filters.tenant_id))
            .filter(tenant_api_key::is_live.eq(filters.is_live))
            .into_boxed();

        if let Some(role_ids) = filters.role_ids.as_ref() {
            query = query.filter(tenant_api_key::role_id.eq_any(role_ids));
        }

        if let Some(status) = filters.status.as_ref() {
            query = query.filter(tenant_api_key::status.eq(status));
        }

        query
    }

    #[tracing::instrument("TenantApiKey::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        filters: &ApiKeyListFilters,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<(TenantApiKey, TenantRole)>> {
        let mut query = Self::list_query(filters)
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

    #[tracing::instrument("TenantApiKey::count", skip_all)]
    pub fn count(conn: &mut PgConn, filters: &ApiKeyListFilters) -> DbResult<i64> {
        let count = Self::list_query(filters).count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("TenantApiKey::get", skip_all)]
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

    #[tracing::instrument("TenantApiKey::get_enabled", skip_all)]
    pub fn get_enabled(
        conn: &mut TxnPgConn,
        sh_api_key: Fingerprint,
    ) -> DbResult<(TenantApiKey, Tenant, TenantRole)> {
        use db_schema::schema::tenant;
        let (api_key, tenant, role): (TenantApiKey, Tenant, TenantRole) = tenant_api_key::table
            .inner_join(tenant::table)
            .inner_join(tenant_role::table)
            .filter(tenant_api_key::sh_secret_api_key.eq(sh_api_key))
            .first(conn.conn())?;
        if api_key.status != ApiKeyStatus::Enabled {
            return Err(DbError::ApiKeyDisabled);
        }
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }
        if role.tenant_id != api_key.tenant_id {
            return Err(DbError::TenantRoleMismatch);
        }
        let api_key = api_key.maybe_update_last_used_at(conn)?;
        Ok((api_key, tenant, role))
    }

    fn should_update_last_used_at(&self) -> bool {
        match self.last_used_at {
            // Save when the key was last used if at least 5 seconds have passed since the last use
            Some(d) if (Utc::now() - d).num_seconds() > 5 => true,
            None => true,
            // No-op, key was updated recently
            _ => false,
        }
    }

    /// Updates the last_used_at timestamp on this API key, including some controls to prevent
    /// flooding the DB with writes for lots of API requests made in rapid succession
    fn maybe_update_last_used_at(self, conn: &mut TxnPgConn) -> DbResult<Self> {
        // First, check if the key has been updated recently. No need to add write throughput to the
        // db if this timestamp was updated recently
        if !self.should_update_last_used_at() {
            return Ok(self);
        }
        let locked_api_key = tenant_api_key::table
            .filter(tenant_api_key::id.eq(&self.id))
            .for_no_key_update()
            .skip_locked()
            .get_result::<Self>(conn.conn())
            .optional()?;
        let Some(locked_api_key) = locked_api_key else {
            // If the API key is already locked by another process, just return - that process will
            // be updating the last used timestamp
            return Ok(self);
        };
        // Check again now that we have the locked row if we need to update the timestamp
        if !locked_api_key.should_update_last_used_at() {
            return Ok(locked_api_key);
        }
        let api_key = diesel::update(tenant_api_key::table)
            .filter(tenant_api_key::id.eq(locked_api_key.id))
            .set(tenant_api_key::last_used_at.eq(Utc::now()))
            .get_result(conn.conn())?;
        Ok(api_key)
    }

    #[tracing::instrument("TenantApiKey::create", skip_all)]
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
            // And, lock the role so it isn't deactivated while we are making the key
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

    #[tracing::instrument("TenantApiKey::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: TenantApiKeyId,
        tenant_id: TenantId,
        is_live: IsLive,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
        role_id: Option<TenantRoleId>,
    ) -> DbResult<(Self, TenantRole)> {
        let update = TenantApiKeyUpdate {
            name,
            status,
            role_id,
        };
        let key = Self::get(conn, (&id, &tenant_id, is_live))?.0;
        let role_id_to_lock = update.role_id.as_ref().unwrap_or(&key.role_id);
        // Lock the role to make sure we don't deactivate it before we update this rolebinding.
        // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
        let new_role = TenantRole::lock_active(conn, role_id_to_lock, &tenant_id)?;
        if new_role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleAlreadyDeactivated);
        }
        let results: Vec<Self> = diesel::update(tenant_api_key::table)
            .filter(tenant_api_key::id.eq(key.id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok((result, new_role.into_inner()))
    }
}
