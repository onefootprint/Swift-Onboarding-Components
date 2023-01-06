use crate::{schema::tenant_role, DbError, DbResult, TxnPgConnection};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantRoleId, TenantScope, TenantScopeList};

use super::tenant::Tenant;

pub type IsImmutable = bool;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_role)]
pub struct TenantRole {
    pub id: TenantRoleId,
    pub tenant_id: TenantId,
    pub name: String,
    pub scopes: TenantScopeList,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Denotes whether this is a default TenantRole that cannot be changed by a tenant.
    /// Each Tenant will have an immutable read-only and immutable admin role
    /// TODO include in HTTP response
    pub is_immutable: IsImmutable,
}

impl TenantRole {
    fn get_or_create_immutable_role(
        conn: &mut TxnPgConnection,
        tenant_id: &TenantId,
        name: &str,
        scopes: Vec<TenantScope>,
    ) -> DbResult<Self> {
        Tenant::lock(conn, tenant_id)?;
        let role = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
            .filter(tenant_role::name.eq(name))
            .filter(tenant_role::scopes.eq(TenantScopeList(scopes.clone())))
            .filter(tenant_role::is_immutable.eq(true))
            .first::<Self>(conn.conn())
            .optional()?;
        let role = if let Some(role) = role {
            role
        } else {
            Self::create(conn, tenant_id.clone(), name.to_owned(), scopes, true)?
        };
        Ok(role)
    }

    /// Every tenant is created with an admin role - this gets or creates that role
    pub fn get_or_create_admin_role(conn: &mut TxnPgConnection, tenant_id: &TenantId) -> DbResult<Self> {
        Self::get_or_create_immutable_role(conn, tenant_id, "Admin", vec![TenantScope::Admin])
    }

    /// Every tenant is created with a read-only role - this gets or creates that role
    pub fn get_or_create_ro_role(conn: &mut TxnPgConnection, tenant_id: &TenantId) -> DbResult<Self> {
        Self::get_or_create_immutable_role(conn, tenant_id, "Read-only", vec![TenantScope::Read])
    }

    pub fn create(
        conn: &mut PgConnection,
        tenant_id: TenantId,
        name: String,
        scopes: Vec<TenantScope>,
        is_immutable: IsImmutable,
    ) -> DbResult<Self> {
        let new = NewTenantRoleRow {
            tenant_id,
            name,
            scopes: TenantScopeList(scopes),
            is_immutable,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(tenant_role::table)
            .values(new)
            .get_result(conn)?;
        Ok(result)
    }

    pub fn lock_active(
        conn: &mut TxnPgConnection,
        id: &TenantRoleId,
        tenant_id: &TenantId,
    ) -> DbResult<Self> {
        let role: TenantRole = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
            .filter(tenant_role::id.eq(id))
            .for_no_key_update() // Make sure someone doesn't deactivate the role while we are using it
            .first(conn.conn())?;
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }
        Ok(role)
    }

    pub fn deactivate(conn: &mut TxnPgConnection, id: &TenantRoleId, tenant_id: &TenantId) -> DbResult<Self> {
        use crate::schema::tenant_user;
        let role = Self::lock_active(conn, id, tenant_id)?;
        if role.is_immutable {
            return Err(DbError::CannotUpdateImmutableRole(role.name));
        }
        // Make sure there are no users using this role before deactivating
        let num_active_users: i64 = tenant_user::table
            .filter(tenant_user::tenant_role_id.eq(&role.id))
            .filter(tenant_user::deactivated_at.is_null())
            .count()
            .get_result(conn.conn())?;
        if num_active_users > 0 {
            return Err(DbError::TenantRoleHasUsers(num_active_users));
        }
        let update = TenantRoleUpdate {
            deactivated_at: Some(Some(Utc::now())),
            ..TenantRoleUpdate::default()
        };
        let results: Vec<Self> = diesel::update(tenant_role::table)
            .filter(tenant_role::id.eq(id))
            .filter(tenant_role::tenant_id.eq(tenant_id))
            // Don't allow updating an immutable role
            .filter(tenant_role::is_immutable.eq(false))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn update(
        conn: &mut TxnPgConnection,
        tenant_id: &TenantId,
        id: &TenantRoleId,
        name: Option<String>,
        scopes: Option<Vec<TenantScope>>,
    ) -> DbResult<Self> {
        let update = TenantRoleUpdate {
            name,
            scopes: scopes.map(TenantScopeList),
            ..TenantRoleUpdate::default()
        };
        let role = Self::lock_active(conn, id, tenant_id)?;
        if role.is_immutable {
            return Err(DbError::CannotUpdateImmutableRole(role.name));
        }
        let results: Vec<Self> = diesel::update(tenant_role::table)
            .filter(tenant_role::id.eq(id))
            .filter(tenant_role::tenant_id.eq(tenant_id))
            // Don't allow updating an immutable role
            .filter(tenant_role::is_immutable.eq(false))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn list_active(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<Self>> {
        let mut query = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
            .filter(tenant_role::deactivated_at.is_null())
            .into_boxed()
            .order_by(tenant_role::created_at.asc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_role::created_at.ge(cursor))
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_role)]
struct NewTenantRoleRow {
    tenant_id: TenantId,
    name: String,
    scopes: TenantScopeList,
    created_at: DateTime<Utc>,
    is_immutable: IsImmutable,
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_role)]
struct TenantRoleUpdate {
    name: Option<String>,
    scopes: Option<TenantScopeList>,
    deactivated_at: Option<Option<DateTime<Utc>>>,
}
