use crate::utils::db2api::DbToApi;
use db::models::tenant_role::TenantRole;
use db::models::tenant_role::TenantRoleInfo;

impl DbToApi<TenantRole> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRole) -> Self {
        Self::from_db((target, None, None))
    }
}

impl DbToApi<TenantRoleInfo> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRoleInfo) -> Self {
        let TenantRoleInfo {
            role,
            num_active_users,
            num_active_api_keys,
        } = target;
        Self::from_db((role, Some(num_active_users), Some(num_active_api_keys)))
    }
}

impl DbToApi<(TenantRole, Option<i64>, Option<i64>)> for api_wire_types::OrganizationRole {
    fn from_db(
        (role, num_active_users, num_active_api_keys): (TenantRole, Option<i64>, Option<i64>),
    ) -> Self {
        let TenantRole {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
            kind,
            ..
        } = role;
        Self {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
            kind,
            num_active_users,
            num_active_api_keys,
        }
    }
}
