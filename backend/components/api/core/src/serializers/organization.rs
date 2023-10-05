use db::models::tenant::Tenant;

use crate::utils::db2api::DbToApi;

pub struct IsAuthMethodSupported(pub bool);
pub struct IsDomainAlreadyClaimed(pub bool);

impl DbToApi<Tenant> for api_wire_types::Organization {
    fn from_db(t: Tenant) -> Self {
        Self::from_db((t, None, None))
    }
}

impl DbToApi<(Tenant, IsDomainAlreadyClaimed)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (Tenant, IsDomainAlreadyClaimed)) -> Self {
        Self::from_db((t, Some(is_domain_already_claimed), None))
    }
}

impl DbToApi<(Tenant, IsAuthMethodSupported)> for api_wire_types::Organization {
    fn from_db((t, is_auth_type_supported): (Tenant, IsAuthMethodSupported)) -> Self {
        Self::from_db((t, None, Some(is_auth_type_supported)))
    }
}

impl
    DbToApi<(
        Tenant,
        Option<IsDomainAlreadyClaimed>,
        Option<IsAuthMethodSupported>,
    )> for api_wire_types::Organization
{
    fn from_db(
        (t, is_domain_already_claimed, is_auth_method_supported): (
            Tenant,
            Option<IsDomainAlreadyClaimed>,
            Option<IsAuthMethodSupported>,
        ),
    ) -> Self {
        let Tenant {
            id,
            name,
            logo_url,
            sandbox_restricted,
            website_url,
            company_size,
            domain,
            allow_domain_access,
            is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
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
            // These fields are only conditionally serialized in some endpoints
            is_domain_already_claimed: is_domain_already_claimed.map(|i| i.0),
            is_auth_method_supported: is_auth_method_supported.map(|i| i.0),
            is_prod_kyc_playbook_restricted: is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
        }
    }
}
