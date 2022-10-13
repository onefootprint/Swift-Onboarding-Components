use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationMember {
    pub id: TenantUserId,
    pub email: String,
    pub last_login_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub role_name: String,
    pub role_id: TenantRoleId,
}
export_schema!(OrganizationMember);
