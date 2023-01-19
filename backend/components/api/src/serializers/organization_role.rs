use db::models::tenant_role::TenantRole;

use crate::utils::db2api::DbToApi;

impl DbToApi<TenantRole> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRole) -> Self {
        let TenantRole {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
            ..
        } = target;
        Self {
            id,
            name,
            scopes,
            is_immutable,
            created_at,
        }
    }
}
