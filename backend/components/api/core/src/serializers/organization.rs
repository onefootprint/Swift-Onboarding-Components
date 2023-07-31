use db::models::tenant::Tenant;

use crate::utils::db2api::DbToApi;

impl DbToApi<Tenant> for api_wire_types::Organization {
    fn from_db(t: Tenant) -> Self {
        Self::from_db((t, None))
    }
}

impl DbToApi<(Tenant, bool)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (Tenant, bool)) -> Self {
        Self::from_db((t, Some(is_domain_already_claimed)))
    }
}

impl DbToApi<(Tenant, Option<bool>)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (Tenant, Option<bool>)) -> Self {
        let Tenant {
            id,
            name,
            logo_url,
            sandbox_restricted,
            website_url,
            company_size,
            domain,
            allow_domain_access,
            ..
        } = t;
        Self {
            id,
            name,
            logo_url,
            is_sandbox_restricted: sandbox_restricted,
            website_url,
            company_size,
            domain,
            allow_domain_access,
            is_domain_already_claimed,
        }
    }
}
