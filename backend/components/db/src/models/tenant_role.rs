use crate::{assert_in_transaction, schema::tenant_role, DbResult};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantPermission, TenantRoleId};
use serde::{Deserialize, Serialize};

use super::tenant::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_role)]
pub struct TenantRole {
    pub id: TenantRoleId,
    pub tenant_id: TenantId,
    pub name: String,
    pub permissions: Vec<TenantPermission>,
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
            .filter(tenant_role::permissions.eq(vec![TenantPermission::Admin]))
            .first::<Self>(conn)
            .optional()?;
        let role = if let Some(role) = role {
            role
        } else {
            NewTenantRole {
                tenant_id,
                name: "Admin".to_owned(),
                permissions: vec![TenantPermission::Admin],
                created_at: Utc::now(),
            }
            .save(conn)?
        };
        Ok(role)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_role)]
pub struct NewTenantRole {
    pub tenant_id: TenantId,
    pub name: String,
    pub permissions: Vec<TenantPermission>,
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
