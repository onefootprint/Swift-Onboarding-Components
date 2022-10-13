use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationRole {
    pub id: TenantRoleId,
    pub name: String,
    pub permissions: TenantPermissionList,
    pub created_at: DateTime<Utc>,
}
export_schema!(OrganizationRole);
