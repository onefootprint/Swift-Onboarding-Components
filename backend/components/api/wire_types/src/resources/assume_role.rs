use crate::*;

#[derive(serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct AssumeRoleRequest {
    pub tenant_id: TenantId,
}

export_schema!(AssumeRoleRequest);

#[derive(serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct AssumeRoleResponse {
    pub user: OrganizationMember,
    pub tenant: Organization,
}

export_schema!(AssumeRoleResponse);
