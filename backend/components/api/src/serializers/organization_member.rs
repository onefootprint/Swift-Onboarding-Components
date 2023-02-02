use db::models::{tenant_role::TenantRole, tenant_rolebinding::TenantRolebinding, tenant_user::TenantUser};

use crate::utils::db2api::DbToApi;

impl DbToApi<(TenantUser, TenantRolebinding, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, rb, role): (TenantUser, TenantRolebinding, TenantRole)) -> Self {
        let TenantUser {
            email,
            first_name,
            last_name,
            ..
        } = user;
        let TenantRolebinding {
            id,
            last_login_at,
            created_at,
            ..
        } = rb;
        let TenantRole {
            name: role_name,
            id: role_id,
            ..
        } = role;
        Self {
            id,
            email: email.0,
            first_name,
            last_name,
            last_login_at,
            created_at,
            role_name,
            role_id,
        }
    }
}

impl DbToApi<(TenantUser, TenantRole)> for api_wire_types::BasicOrganizationMember {
    fn from_db((user, role): (TenantUser, TenantRole)) -> Self {
        let TenantUser {
            email,
            first_name,
            last_name,
            ..
        } = user;
        let role = api_wire_types::OrganizationRole::from_db(role);
        Self {
            email: email.0,
            first_name,
            last_name,
            role,
        }
    }
}
