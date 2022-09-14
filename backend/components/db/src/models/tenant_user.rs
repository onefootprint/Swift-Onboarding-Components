use crate::{models::tenant_role::TenantRole, schema::tenant_user, DbResult};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantRoleId, TenantUserEmail, TenantUserId};
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
    pub fn get_by_email(
        conn: &mut PgConnection,
        email: TenantUserEmail,
    ) -> DbResult<Option<(TenantUser, Tenant)>> {
        use crate::schema::tenant;
        use crate::schema::tenant_role;
        let result: Option<(TenantRole, _, _)> = tenant_role::table
            .inner_join(tenant_user::table)
            .inner_join(tenant::table)
            .filter(tenant_user::email.eq(email))
            .first(conn)
            .optional()?;
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
pub struct NewTenantUser {
    pub tenant_role_id: TenantRoleId,
    pub email: TenantUserEmail,
    pub created_at: DateTime<Utc>,
    pub last_login_at: DateTime<Utc>,
}
