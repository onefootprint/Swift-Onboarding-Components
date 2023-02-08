use crate::*;

/// Member of an organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationMember {
    pub id: TenantUserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: OrganizationRole,
    // Optional since FirmEmployee sessions don't have a rolebinding
    pub rolebinding: Option<OrganizationRolebinding>,
}
export_schema!(OrganizationMember);
