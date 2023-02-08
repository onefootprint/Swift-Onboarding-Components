use crate::utils::db2api::DbToApi;
use db::models::tenant_rolebinding::TenantRolebinding;

impl DbToApi<TenantRolebinding> for api_wire_types::OrganizationRolebinding {
    fn from_db(rb: TenantRolebinding) -> Self {
        let TenantRolebinding { last_login_at, .. } = rb;
        Self { last_login_at }
    }
}
