use crate::*;

/// Organization
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Organization {
    pub id: TenantId,
    pub name: String,
    pub logo_url: Option<String>,
    pub is_sandbox_restricted: bool,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub domain: Option<String>,
    pub allow_domain_access: bool,
    // Only serialize in the GET /org response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_domain_already_claimed: Option<bool>,
}
export_schema!(Organization);
