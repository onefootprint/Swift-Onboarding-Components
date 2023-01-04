use crate::*;

/// IAM Role for an Org
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationRole {
    pub id: TenantRoleId,
    pub name: String,
    pub permissions: Vec<TenantScope>,
    pub created_at: DateTime<Utc>,
}
export_schema!(OrganizationRole);
