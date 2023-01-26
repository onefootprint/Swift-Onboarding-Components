use std::collections::HashMap;

use super::tenant::Tenant;
use crate::{
    schema::tenant_role::{self, BoxedQuery},
    DbError, DbResult, TxnPgConnection,
};
use chrono::{DateTime, Utc};
use diesel::{dsl::count_star, prelude::*};
use diesel::{Insertable, PgConnection, Queryable};
use itertools::Itertools;
use newtypes::{Locked, TenantId, TenantRoleId, TenantScope};

pub type IsImmutable = bool;
pub type NumActiveUsers = i64;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_role)]
pub struct TenantRole {
    pub id: TenantRoleId,
    pub tenant_id: TenantId,
    pub name: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Denotes whether this is a default TenantRole that cannot be changed by a tenant.
    /// Each Tenant will have an immutable read-only and immutable admin role
    pub is_immutable: IsImmutable,
    /// The list of scopes that are granted to every user in this role
    pub scopes: Vec<TenantScope>,
}

impl TenantRole {
    fn validate_scopes(scopes: &[TenantScope]) -> DbResult<()> {
        if !scopes.contains(&TenantScope::Read) && !scopes.contains(&TenantScope::Admin) {
            // Every role must have at least Read permissions for now
            return Err(DbError::InsufficientTenantScopes);
        }
        Ok(())
    }

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
            .filter(tenant_role::scopes.eq(&scopes))
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
        Self::validate_scopes(&scopes)?;
        let new = NewTenantRoleRow {
            tenant_id,
            name,
            scopes,
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
    ) -> DbResult<Locked<Self>> {
        let role: TenantRole = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
            .filter(tenant_role::id.eq(id))
            .for_no_key_update() // Make sure someone doesn't deactivate the role while we are using it
            .first(conn.conn())?;
        if role.deactivated_at.is_some() {
            return Err(DbError::TenantRoleDeactivated);
        }
        Ok(Locked::new(role))
    }

    pub fn deactivate(conn: &mut TxnPgConnection, id: &TenantRoleId, tenant_id: &TenantId) -> DbResult<Self> {
        use crate::schema::tenant_rolebinding;
        let role = Self::lock_active(conn, id, tenant_id)?.into_inner();
        if role.is_immutable {
            return Err(DbError::CannotUpdateImmutableRole(role.name));
        }
        // Make sure there are no users using this role before deactivating
        let num_active_users: i64 = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq(&role.id))
            .filter(tenant_rolebinding::deactivated_at.is_null())
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
        if let Some(scopes) = scopes.as_ref() {
            Self::validate_scopes(scopes)?;
        }
        let update = TenantRoleUpdate {
            name,
            scopes,
            ..TenantRoleUpdate::default()
        };
        let role = Self::lock_active(conn, id, tenant_id)?.into_inner();
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

    pub fn list_active_query<'a>(filters: &'a TenantRoleListFilters) -> BoxedQuery<'a, diesel::pg::Pg> {
        let mut query = tenant_role::table
            .filter(tenant_role::tenant_id.eq(filters.tenant_id))
            .filter(tenant_role::deactivated_at.is_null())
            .into_boxed();

        if let Some(ref scopes) = filters.scopes {
            query = query.filter(tenant_role::scopes.overlaps_with(scopes))
        }
        if let Some(ref name) = filters.name {
            query = query.filter(tenant_role::name.ilike(format!("%{}%", name)))
        }
        query
    }

    pub fn list_active(
        conn: &mut PgConnection,
        filters: &TenantRoleListFilters,
    ) -> DbResult<Vec<(Self, NumActiveUsers)>> {
        use crate::schema::tenant_rolebinding;
        let mut query = Self::list_active_query(filters)
            .order_by(tenant_role::name.asc())
            .limit(filters.page_size + 1);

        if let Some(page) = filters.page {
            query = query.offset(filters.page_size * (page as i64));
        }
        let results: Vec<Self> = query.get_results(conn)?;

        // For each role, fetch the number of active users
        let role_ids = results.iter().map(|r| r.id.clone()).collect_vec();
        let num_active_users_per_role: Vec<(TenantRoleId, NumActiveUsers)> = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq_any(role_ids))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .group_by(tenant_rolebinding::tenant_role_id)
            .select((tenant_rolebinding::tenant_role_id, count_star()))
            .get_results(conn)?;

        // Zip results together
        let mut num_active_users_per_role: HashMap<_, _> = num_active_users_per_role.into_iter().collect();
        let results = results
            .into_iter()
            .map(|r| (num_active_users_per_role.remove(&r.id).unwrap_or_default(), r))
            .map(|(r, count)| (count, r))
            .collect();
        Ok(results)
    }

    pub fn count_active(conn: &mut PgConnection, filters: &TenantRoleListFilters) -> DbResult<i64> {
        let query = Self::list_active_query(filters);
        let count = query.count().get_result(conn)?;
        Ok(count)
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_role)]
struct NewTenantRoleRow {
    tenant_id: TenantId,
    name: String,
    scopes: Vec<TenantScope>,
    created_at: DateTime<Utc>,
    is_immutable: IsImmutable,
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_role)]
struct TenantRoleUpdate {
    name: Option<String>,
    scopes: Option<Vec<TenantScope>>,
    deactivated_at: Option<Option<DateTime<Utc>>>,
}

pub struct TenantRoleListFilters<'a> {
    pub tenant_id: &'a TenantId,
    pub scopes: Option<Vec<TenantScope>>,
    pub name: Option<String>,
    pub page: Option<usize>,
    pub page_size: i64,
}
