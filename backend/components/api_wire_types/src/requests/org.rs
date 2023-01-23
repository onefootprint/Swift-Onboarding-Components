use newtypes::csv::Csv;

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct UpdateTenantRequest {
    pub name: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub logo_url: Option<String>,
    pub privacy_policy_url: Option<String>,
}

export_schema!(UpdateTenantRequest);

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct OrgMemberFilters {
    pub role_ids: Option<Csv<TenantRoleId>>,
    pub search: Option<String>,
    pub is_invite_pending: Option<bool>,
}

export_schema!(OrgMemberFilters);

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct OrgRoleFilters {
    pub scopes: Option<Csv<TenantScope>>,
    pub name: Option<String>,
}

export_schema!(OrgRoleFilters);
