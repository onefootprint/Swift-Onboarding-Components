use crate::*;

/// IAM Role for an Org
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrganizationRole {
    pub id: TenantRoleId,
    pub name: String,
    pub scopes: Vec<TenantScope>,
    pub is_immutable: bool,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_active_users: Option<i64>,
}
export_schema!(OrganizationRole);
