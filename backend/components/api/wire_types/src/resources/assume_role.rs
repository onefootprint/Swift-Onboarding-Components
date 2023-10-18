use crate::*;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct AssumeRoleRequest {
    pub tenant_id: TenantId,
}

#[derive(serde::Serialize, Apiv2Schema)]
pub struct AssumeRoleResponse {
    pub user: OrganizationMember,
    pub tenant: Organization,
}
