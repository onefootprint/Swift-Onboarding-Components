use crate::*;
use newtypes::{
    TenantRoleId,
    TenantRoleKindDiscriminant,
    TenantScope,
};

/// IAM Role for an Org
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct OrganizationRole {
    pub id: TenantRoleId,
    pub name: String,
    pub scopes: Vec<TenantScope>,
    pub is_immutable: bool,
    pub created_at: DateTime<Utc>,
    pub kind: TenantRoleKindDiscriminant,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_active_users: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_active_api_keys: Option<i64>,
}
