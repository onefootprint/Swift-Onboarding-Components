use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::utils::db2api::DbToApi;
use db::models::tenant::Tenant;
use db::models::tenant::TenantWithParent;

pub struct IsAuthMethodSupported(pub bool);
pub struct IsDomainAlreadyClaimed(pub bool);

impl DbToApi<Tenant> for api_wire_types::Organization {
    fn from_db(t: Tenant) -> Self {
        Self::from_db(TenantWithParent::from(t))
    }
}

impl DbToApi<TenantWithParent> for api_wire_types::Organization {
    fn from_db(t: TenantWithParent) -> Self {
        Self::from_db((t, None, None, None))
    }
}

impl DbToApi<(Tenant, IsDomainAlreadyClaimed)> for api_wire_types::Organization {
    fn from_db((t, is_domain_already_claimed): (Tenant, IsDomainAlreadyClaimed)) -> Self {
        Self::from_db((
            TenantWithParent::from(t),
            Some(is_domain_already_claimed),
            None,
            None,
        ))
    }
}

impl
    DbToApi<(
        TenantWithParent,
        IsDomainAlreadyClaimed,
        Option<TenantVendorControl>,
    )> for api_wire_types::Organization
{
    fn from_db(
        (t, is_domain_already_claimed, tvc): (
            TenantWithParent,
            IsDomainAlreadyClaimed,
            Option<TenantVendorControl>,
        ),
    ) -> Self {
        Self::from_db((t, Some(is_domain_already_claimed), None, tvc))
    }
}

impl DbToApi<(Tenant, IsAuthMethodSupported)> for api_wire_types::Organization {
    fn from_db((t, is_auth_type_supported): (Tenant, IsAuthMethodSupported)) -> Self {
        Self::from_db((
            TenantWithParent::from(t),
            None,
            Some(is_auth_type_supported),
            None,
        ))
    }
}

impl DbToApi<(TenantWithParent, IsAuthMethodSupported)> for api_wire_types::Organization {
    fn from_db((t, is_auth_type_supported): (TenantWithParent, IsAuthMethodSupported)) -> Self {
        Self::from_db((t, None, Some(is_auth_type_supported), None))
    }
}

impl
    DbToApi<(
        TenantWithParent,
        Option<IsDomainAlreadyClaimed>,
        Option<IsAuthMethodSupported>,
        Option<TenantVendorControl>,
    )> for api_wire_types::Organization
{
    fn from_db(
        (twp, is_domain_already_claimed, is_auth_method_supported, tenant_vendor_control): (
            TenantWithParent,
            Option<IsDomainAlreadyClaimed>,
            Option<IsAuthMethodSupported>,
            Option<TenantVendorControl>,
        ),
    ) -> Self {
        let t = twp.tenant;
        let is_prod_sentilink_enabled = tenant_vendor_control
            .as_ref()
            .map(|tvc| tvc.is_sentilink_enabled_for_tenant());
        let is_prod_neuro_enabled = tenant_vendor_control
            .as_ref()
            .map(|tvc| tvc.is_neuro_enabled_for_tenant());
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
            allowed_preview_apis,
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
            allowed_preview_apis,
            is_prod_sentilink_enabled,
            is_prod_neuro_enabled,
        }
    }
}
