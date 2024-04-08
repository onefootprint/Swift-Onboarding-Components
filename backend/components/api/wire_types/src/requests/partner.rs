use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdatePartnerTenantRequest {
    pub name: Option<String>,
    pub website_url: Option<String>,
    pub allow_domain_access: Option<bool>,
}
