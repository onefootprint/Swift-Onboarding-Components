use crate::*;
use newtypes::{PartnerTenantId, TenantId};

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct AssumeRoleRequest {
    pub tenant_id: TenantId,
}

#[derive(serde::Serialize, Apiv2Schema)]
pub struct AssumeRoleResponse {
    pub user: OrganizationMember,
    pub tenant: Organization,
}

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct AssumePartnerRoleRequest {
    pub partner_tenant_id: PartnerTenantId,
}

#[derive(serde::Serialize, Apiv2Schema)]
pub struct AssumePartnerRoleResponse {
    pub user: OrganizationMember,
    pub partner_tenant: PartnerOrganization,
}
