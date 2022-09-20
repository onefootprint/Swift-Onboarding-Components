use chrono::{DateTime, Utc};
use db::models::tenant_role::TenantRole;
use newtypes::{TenantPermissionList, TenantRoleId};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct FpTenantRole {
    id: TenantRoleId,
    name: String,
    permissions: TenantPermissionList,
    created_at: DateTime<Utc>,
}

impl From<TenantRole> for FpTenantRole {
    fn from(t: TenantRole) -> Self {
        let TenantRole {
            id,
            name,
            permissions,
            created_at,
            ..
        } = t;
        Self {
            id,
            name,
            permissions,
            created_at,
        }
    }
}
