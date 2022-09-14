use crate::schema::tenant_user;

use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{TenantRoleId, TenantUserId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_user)]
pub struct TenantUser {
    pub id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub email: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub last_login_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_user)]
pub struct NewTenantUser {
    pub tenant_role_id: TenantRoleId,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub last_login_at: DateTime<Utc>,
}
