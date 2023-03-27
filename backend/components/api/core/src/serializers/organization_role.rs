use db::models::tenant_role::TenantRole;

use crate::utils::db2api::DbToApi;

impl DbToApi<TenantRole> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRole) -> Self {
        Self::from_db((target, None))
    }
}

impl DbToApi<(TenantRole, Option<i64>)> for api_wire_types::OrganizationRole {
    fn from_db((role, num_active_users): (TenantRole, Option<i64>)) -> Self {
        let TenantRole {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
            ..
        } = role;
        Self {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
            num_active_users,
        }
    }
}
