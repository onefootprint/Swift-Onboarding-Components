use db::models::{tenant_role::TenantRole, tenant_user::TenantUser};

use crate::utils::db2api::DbToApi;

impl DbToApi<(TenantUser, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, role): (TenantUser, TenantRole)) -> Self {
        let TenantUser {
            id,
            email,
            last_login_at,
            created_at,
            ..
        } = user;
        let TenantRole {
            name: role_name,
            id: role_id,
            ..
        } = role;
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
