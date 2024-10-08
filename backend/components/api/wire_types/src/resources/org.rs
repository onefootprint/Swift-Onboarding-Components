use crate::*;
use newtypes::CompanySize;
use newtypes::PartnerTenantId;
use newtypes::PreviewApi;
use newtypes::TenantId;

/// Organization
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct Organization {
    pub id: TenantId,
    pub name: String,
    pub logo_url: Option<String>,
    pub is_sandbox_restricted: bool,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    // Only serialize in the GET /org response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_domain_already_claimed: Option<bool>,
    // Only serialize in the GET /org/auth/roles response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_auth_method_supported: Option<bool>,
    pub is_prod_kyc_playbook_restricted: bool,
    pub is_prod_kyb_playbook_restricted: bool,
    pub is_prod_auth_playbook_restricted: bool,
    // Only serialize in the GET /org response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_prod_sentilink_enabled: Option<bool>,
    // Only serialize in the GET /org response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_prod_neuro_enabled: Option<bool>,
    pub support_email: Option<String>,
    pub support_phone: Option<String>,
    pub support_website: Option<String>,
    pub parent: Option<ParentOrganization>,
    pub allowed_preview_apis: Vec<PreviewApi>,
}

/// Partner Organization
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PartnerOrganization {
    pub id: PartnerTenantId,
    pub name: String,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    // Only serialize in the GET /partner response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_domain_already_claimed: Option<bool>,
    // Only serialize in the GET /partner/auth/roles response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_auth_method_supported: Option<bool>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
}

/// Parent Organization
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ParentOrganization {
    pub id: TenantId,
    pub name: String,
}
