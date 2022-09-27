use chrono::{DateTime, Utc};
use db::models::{tenant_role::TenantRole, tenant_user::TenantUser};
use newtypes::{TenantRoleId, TenantUserId};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct FpTenantUser {
    id: TenantUserId,
    email: String,
    last_login_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    role_name: String,
    role_id: TenantRoleId,
}

impl From<(TenantUser, TenantRole)> for FpTenantUser {
    fn from(t: (TenantUser, TenantRole)) -> Self {
        let TenantUser {
            id,
            email,
            last_login_at,
            created_at,
            ..
        } = t.0;
        let TenantRole {
            name: role_name,
            id: role_id,
            ..
        } = t.1;
        Self {
            id,
            email: email.0,
            last_login_at,
            created_at,
            role_name,
            role_id,
        }
    }
}
