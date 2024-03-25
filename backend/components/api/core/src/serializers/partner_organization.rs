use db::models::partner_tenant::PartnerTenant;

use crate::utils::db2api::DbToApi;

impl DbToApi<PartnerTenant> for api_wire_types::PartnerOrganization {
    fn from_db(partner_tenant: PartnerTenant) -> Self {
        api_wire_types::PartnerOrganization {
            id: partner_tenant.id,
            name: partner_tenant.name,
            domains: partner_tenant.domains,
            allow_domain_access: partner_tenant.allow_domain_access,
        }
    }
}
