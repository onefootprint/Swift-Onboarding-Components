use crate::*;

fn is_false(b: &bool) -> bool {
    !(*b)
}

/// Member of an organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationMember {
    pub id: TenantUserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    #[serde(skip_serializing_if = "is_false")]
    pub is_firm_employee: bool,
    pub role: OrganizationRole,
    // Optional since FirmEmployee sessions don't have a rolebinding
    pub rolebinding: Option<OrganizationRolebinding>,
}
export_schema!(OrganizationMember);

/// Member of an organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
/// Info on the currently authed user
pub struct AuthOrgMember {
    pub id: TenantUserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    #[serde(skip_serializing_if = "is_false")]
    pub is_firm_employee: bool,
    #[serde(skip_serializing_if = "is_false")]
    pub is_assumed_session: bool,
    pub scopes: Vec<TenantScope>,
    pub tenant: Organization,
}
export_schema!(AuthOrgMember);
