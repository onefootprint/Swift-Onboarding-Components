use crate::{
    assert_in_transaction,
    models::tenant_role::TenantRole,
    schema::{tenant_role, tenant_user},
    DbError, DbResult,
};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantRoleId, TenantUserEmail, TenantUserId};
use serde::{Deserialize, Serialize};

use super::tenant::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_user)]
pub struct TenantUser {
    pub id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub email: TenantUserEmail,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub tenant_id: TenantId,
}

impl TenantUser {
    pub fn login_by_email(
        conn: &mut PgConnection,
        email: TenantUserEmail,
    ) -> DbResult<Option<(TenantUser, Tenant)>> {
        use crate::schema::tenant;
        let result: Option<(TenantRole, TenantUser, Tenant)> = tenant_role::table
            .inner_join(tenant_user::table)
            .inner_join(tenant::table)
            .filter(tenant_user::email.eq(email))
            .first(conn)
            .optional()?;
        if let Some((_, u, _)) = result.as_ref() {
            diesel::update(tenant_user::table)
                .filter(tenant_user::id.eq(&u.id))
                .set(tenant_user::last_login_at.eq(Utc::now()))
                .get_result::<TenantUser>(conn)?;
        }
        Ok(result.map(|(_, tenant_user, tenant)| (tenant_user, tenant)))
    }

    pub fn create(
        conn: &mut PgConnection,
        email: TenantUserEmail,
        tenant_id: TenantId,
        tenant_role_id: TenantRoleId,
    ) -> DbResult<(Self, TenantRole)> {
        // Make sure the role we are using belongs to the tenant, otherwise could invite self to
        // another tenant's role
        let tenant_role: TenantRole = tenant_role::table
            .filter(tenant_role::tenant_id.eq(&tenant_id))
            .filter(tenant_role::id.eq(&tenant_role_id))
            .first(conn)?;
        let new_user = NewTenantUser {
            tenant_role_id: tenant_role.id.clone(),
            email,
            created_at: Utc::now(),
            // init to None since they haven't logged in yet!
            last_login_at: None,
            tenant_id,
        };
        let result = diesel::insert_into(tenant_user::table)
            .values(new_user)
            .get_result(conn)?;
        Ok((result, tenant_role))
    }

    pub fn update(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        id: &TenantUserId,
        tenant_role_id: Option<TenantRoleId>,
    ) -> DbResult<Self> {
        assert_in_transaction(conn)?; // Otherwise could create updates to multiple rows accidentally
        if let Some(tenant_role_id) = tenant_role_id.as_ref() {
            // Make sure the role we are using belongs to the tenant, otherwise could update permissions to work on another tenant's role
            tenant_role::table
                .filter(tenant_role::tenant_id.eq(tenant_id))
                .filter(tenant_role::id.eq(tenant_role_id))
                .first::<TenantRole>(conn)?;
        }
        let user_update = TenantUserUpdate { tenant_role_id };
        let results: Vec<Self> = diesel::update(tenant_user::table)
            .filter(tenant_user::tenant_id.eq(tenant_id))
            .filter(tenant_user::id.eq(id))
            .set(user_update)
            .load(conn)?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    pub fn list(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<(Self, TenantRole)>> {
        let mut query = tenant_user::table
            .inner_join(tenant_role::table)
            .filter(tenant_user::tenant_id.eq(tenant_id))
            .into_boxed()
            .order_by(tenant_user::created_at.asc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(tenant_user::created_at.ge(cursor))
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
struct NewTenantUser {
    tenant_role_id: TenantRoleId,
    email: TenantUserEmail,
    created_at: DateTime<Utc>,
    last_login_at: Option<DateTime<Utc>>,
    tenant_id: TenantId,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_user)]
struct TenantUserUpdate {
    tenant_role_id: Option<TenantRoleId>,
}
