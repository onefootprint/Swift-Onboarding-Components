use db::models::{
    billing_profile::BillingProfile,
    tenant::{Tenant, UserCounts},
};

use crate::utils::db2api::DbToApi;

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


impl DbToApi<(Tenant, Option<BillingProfile>)> for api_wire_types::PrivateTenantDetail {
    fn from_db((t, bp): (Tenant, Option<BillingProfile>)) -> Self {
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

            billing_profile: bp.map(api_wire_types::PrivateBillingProfile::from_db),
        }
    }
}


impl DbToApi<BillingProfile> for api_wire_types::PrivateBillingProfile {
    fn from_db(bp: BillingProfile) -> Self {
        let BillingProfile {
            kyc,
            kyb,
            pii,
            id_docs,
            watchlist,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
            adverse_media_per_user,
            continuous_monitoring_per_year,
            monthly_minimum,
            kyc_waterfall_second_vendor,
            kyc_waterfall_third_vendor,
            one_click_kyc,

            id: _,
            _created_at: _,
            _updated_at: _,
            tenant_id: _,
        } = bp;

        Self {
            kyc,
            kyb,
            pii,
            id_docs,
            watchlist,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
            adverse_media_per_user,
            continuous_monitoring_per_year,
            monthly_minimum,
            kyc_waterfall_second_vendor,
            kyc_waterfall_third_vendor,
            one_click_kyc,
        }
    }
}
