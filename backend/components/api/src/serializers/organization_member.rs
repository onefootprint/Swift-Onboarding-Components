use db::models::{tenant_role::TenantRole, tenant_rolebinding::TenantRolebinding, tenant_user::TenantUser};

use crate::utils::db2api::DbToApi;

impl DbToApi<(TenantUser, Option<TenantRolebinding>, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, rb, role): (TenantUser, Option<TenantRolebinding>, TenantRole)) -> Self {
        let TenantUser {
            id,
            email,
            first_name,
            last_name,
            ..
        } = user;
        let rolebinding = rb.map(api_wire_types::OrganizationRolebinding::from_db);
        let role = api_wire_types::OrganizationRole::from_db(role);
        Self {
            id,
            email: email.0,
            first_name,
            last_name,
            role,
            rolebinding,
        }
    }
}

impl DbToApi<(TenantUser, TenantRolebinding, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, rb, role): (TenantUser, TenantRolebinding, TenantRole)) -> Self {
        Self::from_db((user, Some(rb), role))
    }
}
