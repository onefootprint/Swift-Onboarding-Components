use super::IsDomainAlreadyClaimed;
use crate::utils::db2api::DbToApi;
use db::models::partner_tenant::PartnerTenant;

impl DbToApi<PartnerTenant> for api_wire_types::PartnerOrganization {
    fn from_db(partner_tenant: PartnerTenant) -> Self {
        api_wire_types::PartnerOrganization::from_db((partner_tenant, None))
    }
}

impl DbToApi<(PartnerTenant, Option<IsDomainAlreadyClaimed>)> for api_wire_types::PartnerOrganization {
    fn from_db(
        (partner_tenant, is_domain_already_claimed): (PartnerTenant, Option<IsDomainAlreadyClaimed>),
    ) -> Self {
        api_wire_types::PartnerOrganization {
            id: partner_tenant.id,
            name: partner_tenant.name,
            domains: partner_tenant.domains,
            allow_domain_access: partner_tenant.allow_domain_access,
            is_domain_already_claimed: is_domain_already_claimed.map(|i| i.0),
            logo_url: partner_tenant.logo_url,
            website_url: partner_tenant.website_url,
        }
    }
}
