use crate::utils::db2api::DbToApi;
use db::models::tenant::Tenant;
use db::models::tenant_role::TenantRole;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use newtypes::TenantScope;

impl DbToApi<(TenantUser, Option<TenantRolebinding>, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, rb, role): (TenantUser, Option<TenantRolebinding>, TenantRole)) -> Self {
        let TenantUser {
            id,
            email,
            first_name,
            last_name,
            is_firm_employee,
            created_at,
            ..
        } = user;
        let rolebinding = rb.map(api_wire_types::OrganizationRolebinding::from_db);
        let role = api_wire_types::OrganizationRole::from_db(role);
        Self {
            id,
            email: email.0,
            first_name,
            last_name,
            is_firm_employee,
            role,
            rolebinding,
            created_at,
        }
    }
}

impl DbToApi<(TenantUser, TenantRolebinding, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, rb, role): (TenantUser, TenantRolebinding, TenantRole)) -> Self {
        Self::from_db((user, Some(rb), role))
    }
}

type AuthedOrgMemberInfo = (TenantUser, Option<TenantRolebinding>, Tenant, Vec<TenantScope>);

impl DbToApi<AuthedOrgMemberInfo> for api_wire_types::AuthOrgMember {
    fn from_db((user, rb, tenant, scopes): AuthedOrgMemberInfo) -> Self {
        let TenantUser {
            id,
            email,
            first_name,
            last_name,
            is_firm_employee,
            ..
        } = user;
        let tenant = api_wire_types::Organization::from_db(tenant);
        Self {
            id,
            email: email.0,
            first_name,
            last_name,
            is_firm_employee,
            is_assumed_session: rb.is_none(),
            tenant,
            scopes,
        }
    }
}

impl DbToApi<TenantUser> for api_wire_types::LiteOrgMember {
    fn from_db(user: TenantUser) -> Self {
        let TenantUser {
            id,
            first_name,
            last_name,
            ..
        } = user;
        Self {
            id,
            first_name,
            last_name,
        }
    }
}
