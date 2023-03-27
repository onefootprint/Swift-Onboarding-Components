use crate::*;

/// Organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Organization {
    pub id: TenantId,
    pub name: String,
    pub logo_url: Option<String>,
    pub is_sandbox_restricted: bool,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
}
export_schema!(Organization);
