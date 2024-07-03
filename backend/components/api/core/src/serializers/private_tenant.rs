use crate::utils::db2api::DbToApi;
use db::models::billing_profile::BillingProfile;
use db::models::tenant::Tenant;
use db::models::tenant::UserCounts;
use db::models::tenant_vendor::TenantVendorControl;

impl DbToApi<(Option<UserCounts>, Tenant)> for api_wire_types::PrivateTenant {
    fn from_db((counts, t): (Option<UserCounts>, Tenant)) -> Self {
        let Tenant {
            id,
            name,
            domains,
            allow_domain_access,
            sandbox_restricted,
            is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            supported_auth_methods,
            _created_at,
            super_tenant_id,
            ..
        } = t;
        Self {
            id,
            name,
            domains,
            allow_domain_access,
            is_live: !sandbox_restricted,
            is_prod_kyc_playbook_restricted: is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            supported_auth_methods,
            num_live_vaults: counts.as_ref().map(|c| c.live).unwrap_or_default(),
            num_sandbox_vaults: counts.as_ref().map(|c| c.sandbox).unwrap_or_default(),
            created_at: _created_at,
            super_tenant_id,
        }
    }
}

impl DbToApi<(Tenant, Option<BillingProfile>, Option<TenantVendorControl>)>
    for api_wire_types::PrivateTenantDetail
{
    fn from_db((t, bp, tvc): (Tenant, Option<BillingProfile>, Option<TenantVendorControl>)) -> Self {
        let Tenant {
            id,
            name,
            _created_at,

            domains,
            allow_domain_access,

            sandbox_restricted,
            is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            is_prod_auth_playbook_restricted,

            supported_auth_methods,
            allowed_preview_apis,
            pinned_api_version,
            is_demo_tenant,

            super_tenant_id,
            workos_id,
            stripe_customer_id,
            app_clip_experience_id,
            ..
        } = t;
        Self {
            id,
            name,
            created_at: _created_at,

            domains,
            allow_domain_access,

            sandbox_restricted,
            is_prod_kyc_playbook_restricted: is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            is_prod_auth_playbook_restricted,

            supported_auth_methods,
            allowed_preview_apis,
            pinned_api_version,
            is_demo_tenant,

            super_tenant_id,
            workos_id,
            stripe_customer_id,
            app_clip_experience_id,

            billing_profile: bp.map(|bp| bp.prices.into()),
            vendor_control: tvc.map(api_wire_types::PrivateTenantVendorControl::from_db),
        }
    }
}

impl DbToApi<TenantVendorControl> for api_wire_types::PrivateTenantVendorControl {
    fn from_db(bp: TenantVendorControl) -> Self {
        let TenantVendorControl {
            idology_enabled,
            experian_enabled,
            lexis_enabled,
            experian_subscriber_code,
            middesk_api_key,

            id: _,
            tenant_id: _,
            deactivated_at: _,
            _created_at: _,
            _updated_at: _,
        } = bp;

        Self {
            idology_enabled,
            experian_enabled,
            lexis_enabled,
            experian_subscriber_code,
            middesk_api_key_exists: middesk_api_key.is_some(),
        }
    }
}
