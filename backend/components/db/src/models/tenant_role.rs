use crate::{assert_in_transaction, schema::tenant_role, DbResult};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantPermission, TenantPermissionList, TenantRoleId};

use super::tenant::Tenant;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_role)]
pub struct TenantRole {
    pub id: TenantRoleId,
    pub tenant_id: TenantId,
    pub name: String,
    pub permissions: TenantPermissionList,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

impl TenantRole {
    pub fn get_or_create_admin_role(conn: &mut PgConnection, tenant_id: TenantId) -> DbResult<Self> {
        assert_in_transaction(conn)?; // Doesn't make sense to lock outside of a txn
        Tenant::lock(conn, &tenant_id)?;
        let role = tenant_role::table
            .filter(tenant_role::tenant_id.eq(&tenant_id))
            .filter(tenant_role::permissions.eq(TenantPermissionList(vec![TenantPermission::Admin])))
            .first::<Self>(conn)
            .optional()?;
        let role = if let Some(role) = role {
            role
        } else {
            Self::create(conn, tenant_id, "Admin".to_owned(), vec![TenantPermission::Admin])?
        };
        Ok(role)
    }

    pub fn create(
        conn: &mut PgConnection,
        tenant_id: TenantId,
        name: String,
        permissions: Vec<TenantPermission>,
    ) -> DbResult<Self> {
        let result = NewTenantRole {
            tenant_id,
            name,
            permissions: permissions.into(),
            created_at: Utc::now(),
        }
        .save(conn)?;
        Ok(result)
    }

    pub fn list(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<Self>> {
        let mut query = tenant_role::table
            .filter(tenant_role::tenant_id.eq(tenant_id))
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
    pub permissions: TenantPermissionList,
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
