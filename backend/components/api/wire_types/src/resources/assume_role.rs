use crate::*;
use newtypes::PartnerTenantId;
use newtypes::SessionAuthToken;
use newtypes::TenantId;
use newtypes::TenantSessionPurpose;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct AssumeRoleRequest {
    pub tenant_id: TenantId,
    // TODO make required
    pub purpose: Option<TenantSessionPurpose>,
}

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AssumeRoleResponse {
    pub token: SessionAuthToken,
    pub user: OrganizationMember,
    pub tenant: Organization,
}

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct AssumePartnerRoleRequest {
    pub partner_tenant_id: PartnerTenantId,
}

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AssumePartnerRoleResponse {
    pub token: SessionAuthToken,
    pub user: OrganizationMember,
    pub partner_tenant: PartnerOrganization,
}
