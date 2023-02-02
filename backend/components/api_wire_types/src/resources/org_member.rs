use crate::*;

/// Member of an organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationMember {
    pub id: TenantRolebindingId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub role_name: String,
    pub role_id: TenantRoleId,
}
export_schema!(OrganizationMember);

/// Member of an organization
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct BasicOrganizationMember {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: OrganizationRole,
}
export_schema!(BasicOrganizationMember);
