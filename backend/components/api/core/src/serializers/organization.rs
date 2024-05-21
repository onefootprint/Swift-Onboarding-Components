use db::models::tenant::{Tenant, TenantWithParent};

use crate::utils::db2api::DbToApi;

pub struct IsAuthMethodSupported(pub bool);
pub struct IsDomainAlreadyClaimed(pub bool);

impl DbToApi<Tenant> for api_wire_types::Organization {
    fn from_db(t: Tenant) -> Self {
        Self::from_db(TenantWithParent::from(t))
    }
}

impl DbToApi<TenantWithParent> for api_wire_types::Organization {
    fn from_db(t: TenantWithParent) -> Self {
        Self::from_db((t, None, None))
    }
}

impl DbToApi<(Tenant, IsDomainAlreadyClaimed)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (Tenant, IsDomainAlreadyClaimed)) -> Self {
        Self::from_db((TenantWithParent::from(t), Some(is_domain_already_claimed), None))
    }
}

impl DbToApi<(TenantWithParent, IsDomainAlreadyClaimed)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (TenantWithParent, IsDomainAlreadyClaimed)) -> Self {
        Self::from_db((t, Some(is_domain_already_claimed), None))
    }
}

impl DbToApi<(Tenant, IsAuthMethodSupported)> for api_wire_types::Organization {
    fn from_db((t, is_auth_type_supported): (Tenant, IsAuthMethodSupported)) -> Self {
        Self::from_db((TenantWithParent::from(t), None, Some(is_auth_type_supported)))
    }
}

impl DbToApi<(TenantWithParent, IsAuthMethodSupported)> for api_wire_types::Organization {
    fn from_db((t, is_auth_type_supported): (TenantWithParent, IsAuthMethodSupported)) -> Self {
        Self::from_db((t, None, Some(is_auth_type_supported)))
    }
}

impl
    DbToApi<(
        TenantWithParent,
        Option<IsDomainAlreadyClaimed>,
        Option<IsAuthMethodSupported>,
    )> for api_wire_types::Organization
{
    fn from_db(
        (twp, is_domain_already_claimed, is_auth_method_supported): (
            TenantWithParent,
            Option<IsDomainAlreadyClaimed>,
            Option<IsAuthMethodSupported>,
        ),
    ) -> Self {
        let t = twp.tenant;
        let Tenant {
            id,
            name,
            logo_url,
            sandbox_restricted,
            website_url,
            company_size,
            domains,
            allow_domain_access,
            is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            is_prod_auth_playbook_restricted,
            support_email,
            support_phone,
            support_website,
            ..
        } = t;
        Self {
            id,
            name,
            logo_url,
            is_sandbox_restricted: sandbox_restricted,
            website_url,
            company_size,
            domains,
            allow_domain_access,
            // These fields are only conditionally serialized in some endpoints
            is_domain_already_claimed: is_domain_already_claimed.map(|i| i.0),
            is_auth_method_supported: is_auth_method_supported.map(|i| i.0),
            is_prod_kyc_playbook_restricted: is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            is_prod_auth_playbook_restricted,
            support_email,
            support_phone,
            support_website,
            parent: twp.parent.map(|p| api_wire_types::ParentOrganization {
                id: p.id,
                name: p.name,
            }),
        }
    }
}
