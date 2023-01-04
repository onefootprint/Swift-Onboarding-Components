use crate::{schema::tenant_role, DbError, DbResult, TxnPgConnection};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantRoleId, TenantScope, TenantScopeList};

use super::tenant::Tenant;

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
}

impl TenantRole {
    pub fn get_or_create_admin_role(conn: &mut TxnPgConnection, tenant_id: TenantId) -> DbResult<Self> {
        Tenant::lock(conn, &tenant_id)?;
        let role = tenant_role::table
            .filter(tenant_role::tenant_id.eq(&tenant_id))
            .filter(tenant_role::scopes.eq(TenantScopeList(vec![TenantScope::Admin])))
            .first::<Self>(conn.conn())
            .optional()?;
        let role = if let Some(role) = role {
            role
        } else {
            Self::create(conn, tenant_id, "Admin".to_owned(), vec![TenantScope::Admin])?
        };
        Ok(role)
    }

    pub fn create(
        conn: &mut PgConnection,
        tenant_id: TenantId,
        name: String,
        scopes: Vec<TenantScope>,
    ) -> DbResult<Self> {
        let result = NewTenantRole {
            tenant_id,
            name,
            scopes: TenantScopeList(scopes),
            created_at: Utc::now(),
        }
        .save(conn)?;
        Ok(result)
    }

    pub fn get_active(conn: &mut TxnPgConnection, id: &TenantRoleId, tenant_id: &TenantId) -> DbResult<Self> {
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
        let role = Self::get_active(conn, id, tenant_id)?;
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
        let results: Vec<Self> = diesel::update(tenant_role::table)
            .filter(tenant_role::id.eq(id))
            .filter(tenant_role::tenant_id.eq(tenant_id))
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
pub struct NewTenantRole {
    pub tenant_id: TenantId,
    pub name: String,
    pub scopes: TenantScopeList,
    pub created_at: DateTime<Utc>,
}

impl NewTenantRole {
    pub fn save(&self, conn: &mut PgConnection) -> DbResult<TenantRole> {
        let result = diesel::insert_into(tenant_role::table)
            .values(self)
            .get_result(conn)?;
        Ok(result)
    }
}

#[derive(AsChangeset, Default)]
#[diesel(table_name = tenant_role)]
struct TenantRoleUpdate {
    name: Option<String>,
    scopes: Option<TenantScopeList>,
    deactivated_at: Option<Option<DateTime<Utc>>>,
}
