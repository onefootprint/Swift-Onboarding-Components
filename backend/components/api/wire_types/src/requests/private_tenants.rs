use crate::*;
use newtypes::AppClipExperienceId;
use newtypes::PiiString;
use newtypes::PreviewApi;
use newtypes::StripeCustomerId;
use newtypes::TenantId;
use newtypes::WorkosAuthMethod;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PrivateTenantFilters {
    pub search: Option<String>,
    pub is_live: Option<bool>,
    pub only_with_domains: Option<bool>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct PrivateTenant {
    pub id: TenantId,
    pub name: String,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    pub is_live: bool,
    pub is_prod_kyc_playbook_restricted: bool,
    pub is_prod_kyb_playbook_restricted: bool,
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub num_live_vaults: i64,
    pub num_sandbox_vaults: i64,
    pub created_at: DateTime<Utc>,
    pub super_tenant_id: Option<TenantId>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PrivateTenantDetail {
    pub id: TenantId,
    pub name: String,
    pub created_at: DateTime<Utc>,

    pub domains: Vec<String>,
    pub allow_domain_access: bool,

    pub sandbox_restricted: bool,
    pub is_prod_kyc_playbook_restricted: bool,
    pub is_prod_kyb_playbook_restricted: bool,
    pub is_prod_auth_playbook_restricted: bool,

    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub allowed_preview_apis: Vec<PreviewApi>,
    pub pinned_api_version: Option<i32>,
    pub is_demo_tenant: bool,

    pub super_tenant_id: Option<TenantId>,
    pub workos_id: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
    pub app_clip_experience_id: AppClipExperienceId,

    pub billing_profile: Option<PrivateBillingProfile>,
    pub vendor_control: Option<PrivateTenantVendorControl>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct PrivateBillingProfile {
    pub kyc: Option<String>,
    pub one_click_kyc: Option<String>,
    pub kyc_waterfall_second_vendor: Option<String>,
    pub kyc_waterfall_third_vendor: Option<String>,

    pub id_docs: Option<String>,
    pub kyb: Option<String>,
    pub kyb_ein_only: Option<String>,
    pub curp_verification: Option<String>,

    pub pii: Option<String>,
    pub hot_vaults: Option<String>,
    pub hot_proxy_vaults: Option<String>,
    pub vaults_with_non_pci: Option<String>,
    pub vaults_with_pci: Option<String>,

    pub watchlist: Option<String>,
    pub adverse_media_per_user: Option<String>,
    pub continuous_monitoring_per_year: Option<String>,

    pub monthly_minimum: Option<String>,
    pub monthly_platform_fee: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct PrivateTenantVendorControl {
    pub idology_enabled: bool,
    pub experian_enabled: bool,
    pub lexis_enabled: bool,
    pub experian_subscriber_code: Option<String>,
    pub middesk_api_key_exists: bool,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PrivateUpdateBillingProfile {
    #[serde(default)]
    pub kyc: Patch<String>,
    #[serde(default)]
    pub one_click_kyc: Patch<String>,
    #[serde(default)]
    pub kyc_waterfall_second_vendor: Patch<String>,
    #[serde(default)]
    pub kyc_waterfall_third_vendor: Patch<String>,

    #[serde(default)]
    pub id_docs: Patch<String>,
    #[serde(default)]
    pub kyb: Patch<String>,
    #[serde(default)]
    pub kyb_ein_only: Patch<String>,
    #[serde(default)]
    pub curp_verification: Patch<String>,

    #[serde(default)]
    pub pii: Patch<String>,
    #[serde(default)]
    pub hot_vaults: Patch<String>,
    #[serde(default)]
    pub hot_proxy_vaults: Patch<String>,
    #[serde(default)]
    pub vaults_with_non_pci: Patch<String>,
    #[serde(default)]
    pub vaults_with_pci: Patch<String>,

    #[serde(default)]
    pub watchlist: Patch<String>,
    #[serde(default)]
    pub adverse_media_per_user: Patch<String>,
    #[serde(default)]
    pub continuous_monitoring_per_year: Patch<String>,

    #[serde(default)]
    pub monthly_minimum: Patch<String>,
    #[serde(default)]
    pub monthly_platform_fee: Patch<String>,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PrivateUpdateTvc {
    pub idology_enabled: Option<bool>,
    pub lexis_enabled: Option<bool>,
    pub experian_enabled: Option<bool>,
    #[serde(default)]
    pub experian_subscriber_code: Patch<String>,
    #[serde(default)]
    pub middesk_api_key: Patch<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PrivatePatchTenant {
    pub name: Option<String>,

    pub domains: Option<Vec<String>>,
    pub allow_domain_access: Option<bool>,

    pub sandbox_restricted: Option<bool>,
    pub is_prod_kyc_playbook_restricted: Option<bool>,
    pub is_prod_kyb_playbook_restricted: Option<bool>,
    pub is_prod_auth_playbook_restricted: Option<bool>,

    #[serde(default)]
    pub supported_auth_methods: Patch<Vec<WorkosAuthMethod>>,
    pub allowed_preview_apis: Option<Vec<PreviewApi>>,
    #[serde(default)]
    pub pinned_api_version: Patch<i32>,
    pub is_demo_tenant: Option<bool>,

    #[serde(default)]
    pub super_tenant_id: Patch<TenantId>,

    pub billing_profile: Option<PrivateUpdateBillingProfile>,
    pub vendor_control: Option<PrivateUpdateTvc>,
}
