use std::collections::HashMap;

use super::tenant::Tenant;
use crate::PgConn;
use crate::{
    schema::tenant_role::{self, BoxedQuery},
    DbError, DbResult, NextPage, OffsetPagination, TxnPgConn,
};
use chrono::{DateTime, Utc};
use diesel::{dsl::count_star, prelude::*};
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{ApiKeyStatus, Locked, TenantId, TenantRoleId, TenantScope};

pub type IsImmutable = bool;
pub type NumActiveUsers = i64;
pub type NumActiveApiKeys = i64;

pub struct TenantRoleInfo {
    pub role: TenantRole,
    pub num_active_users: NumActiveUsers,
    pub num_active_api_keys: NumActiveApiKeys,
}

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

#[derive(Debug, Clone, Copy)]
/// Represents the two immutable roles that every tenant has
pub enum ImmutableRoleKind {
    Admin,
    ReadOnly,
}

impl ImmutableRoleKind {
    fn props(&self) -> (&str, Vec<TenantScope>) {
        match self {
            Self::Admin => ("Admin", vec![TenantScope::Admin]),
            Self::ReadOnly => ("Member", vec![TenantScope::Read]),
        }
    }
}

impl TenantRole {
    fn validate_scopes(scopes: &[TenantScope]) -> DbResult<()> {
        if !scopes.contains(&TenantScope::Read) && !scopes.contains(&TenantScope::Admin) {
            // Every role must have at least Read permissions for now
            return Err(DbError::InsufficientTenantScopes);
        }
        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub fn get_immutable(conn: &mut PgConn, tenant_id: &TenantId, kind: ImmutableRoleKind) -> DbResult<Self> {
        let (name, scopes) = kind.props();
        let role = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
            .filter(tenant_role::name.eq(name))
            .filter(tenant_role::scopes.eq(&scopes))
            .filter(tenant_role::is_immutable.eq(true))
            .first::<Self>(conn)?;
        Ok(role)
    }

    /// Every tenant is created with an admin/read only role - this gets or creates that role
    #[tracing::instrument(skip_all)]
    pub fn get_or_create_immutable(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        kind: ImmutableRoleKind,
    ) -> DbResult<Self> {
        Tenant::lock(conn, tenant_id)?;
        let role = Self::get_immutable(conn, tenant_id, kind);
        let role = match role {
            Ok(role) => role,
            Err(e) => {
                if e.is_not_found() {
                    // If the role is not found, create it
                    let (name, scopes) = kind.props();
                    Self::create(conn, tenant_id.clone(), name.to_owned(), scopes, true)?
                } else {
                    return Err(e);
                }
            }
        };
        Ok(role)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, id: &TenantRoleId) -> DbResult<Self> {
        let role = tenant_role::table
            .filter(tenant_role::id.eq(id))
            .first::<Self>(conn)?;
        Ok(role)
    }

    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
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
            .get_result(conn)
            .map_err(DbError::from)
            .map_err(|e| {
                if e.is_unique_constraint_violation() {
                    // There's already a role with this name at this tenant
                    DbError::TenantRoleAlreadyExists
                } else {
                    e
                }
            })?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn lock_active(
        conn: &mut TxnPgConn,
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

    #[tracing::instrument(skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, id: &TenantRoleId, tenant_id: &TenantId) -> DbResult<Self> {
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

    #[tracing::instrument(skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
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
            .load(conn.conn())
            .map_err(DbError::from)
            .map_err(|e| {
                if e.is_unique_constraint_violation() {
                    // There's already a role with this name at this tenant
                    DbError::TenantRoleAlreadyExists
                } else {
                    e
                }
            })?;

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
        if let Some(ref search) = filters.search {
            query = query.filter(tenant_role::name.ilike(format!("%{}%", search)))
        }
        query
    }

    #[tracing::instrument(skip_all)]
    pub fn list_active(
        conn: &mut PgConn,
        filters: &TenantRoleListFilters,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<TenantRoleInfo>, NextPage)> {
        use crate::schema::{tenant_api_key, tenant_rolebinding};
        let mut query = Self::list_active_query(filters)
            .order_by(tenant_role::name.asc())
            .limit(pagination.limit());

        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results: Vec<Self> = query.get_results(conn)?;

        // For each role, fetch the number of active users and api keys
        let role_ids = results.iter().map(|r| r.id.clone()).collect_vec();
        let num_active_users_per_role: Vec<(TenantRoleId, NumActiveUsers)> = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq_any(&role_ids))
            .filter(tenant_rolebinding::deactivated_at.is_null())
            .group_by(tenant_rolebinding::tenant_role_id)
            .select((tenant_rolebinding::tenant_role_id, count_star()))
            .get_results(conn)?;

        let num_active_keys_per_role: Vec<(TenantRoleId, NumActiveApiKeys)> = tenant_api_key::table
            .filter(tenant_api_key::role_id.eq_any(&role_ids))
            .filter(tenant_api_key::status.eq(ApiKeyStatus::Enabled))
            .group_by(tenant_api_key::role_id)
            .select((tenant_api_key::role_id, count_star()))
            .get_results(conn)?;

        // Zip results together
        let mut num_active_users_per_role: HashMap<_, _> = num_active_users_per_role.into_iter().collect();
        let mut num_active_keys_per_role: HashMap<_, _> = num_active_keys_per_role.into_iter().collect();
        let results = results
            .into_iter()
            .map(|r| TenantRoleInfo {
                num_active_users: num_active_users_per_role.remove(&r.id).unwrap_or_default(),
                num_active_api_keys: num_active_keys_per_role.remove(&r.id).unwrap_or_default(),
                role: r,
            })
            .collect();
        let results = pagination.results(results);
        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn count_active(conn: &mut PgConn, filters: &TenantRoleListFilters) -> DbResult<i64> {
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
    pub search: Option<String>,
}
