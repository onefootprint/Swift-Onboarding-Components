use crate::{
    models::tenant_role::TenantRole,
    schema::{tenant_role, tenant_user},
    DbResult,
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
    pub last_login_at: DateTime<Utc>,
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
        tenant_role_id: TenantRoleId,
    ) -> DbResult<TenantUser> {
        let new_user = NewTenantUser {
            tenant_role_id,
            email,
            created_at: Utc::now(),
            last_login_at: Utc::now(),
        };
        let result = diesel::insert_into(tenant_user::table)
            .values(new_user)
            .get_result(conn)?;
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
            .filter(tenant_role::tenant_id.eq(tenant_id))
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
pub struct NewTenantUser {
    pub tenant_role_id: TenantRoleId,
    pub email: TenantUserEmail,
    pub created_at: DateTime<Utc>,
    pub last_login_at: DateTime<Utc>,
}
