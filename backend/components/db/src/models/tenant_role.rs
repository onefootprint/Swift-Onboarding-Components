use crate::{schema::tenant_role, DbResult};
use diesel::prelude::*;

use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{TenantId, TenantPermission, TenantRoleId};
use serde::{Deserialize, Serialize};

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
