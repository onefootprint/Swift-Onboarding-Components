use db::models::tenant::Tenant;

use crate::utils::db2api::DbToApi;

impl DbToApi<Tenant> for api_wire_types::Organization {
    fn from_db(t: Tenant) -> Self {
        let Tenant {
            name,
            logo_url,
            sandbox_restricted,
            ..
        } = t;
        Self {
            name,
            logo_url,
            is_sandbox_restricted: sandbox_restricted,
        }
    }
}
