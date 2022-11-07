use db::models::tenant_role::TenantRole;

use crate::utils::db2api::DbToApi;

impl DbToApi<TenantRole> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRole) -> Self {
        let TenantRole {
            id,
            name,
            permissions,
            created_at,
            ..
        } = target;
        Self {
            id,
            name,
            permissions,
            created_at,
        }
    }
}
