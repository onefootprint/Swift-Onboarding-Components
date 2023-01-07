use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{TenantId, TenantRoleId, TenantRolebindingId, TenantUserId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = tenant_rolebinding)]
pub struct TenantRolebinding {
    pub id: TenantRolebindingId,
    pub tenant_user_id: TenantUserId,
    pub tenant_role_id: TenantRoleId,
    pub tenant_id: TenantId,
    pub last_login_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
