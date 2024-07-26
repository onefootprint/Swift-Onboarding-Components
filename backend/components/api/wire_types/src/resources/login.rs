use crate::*;
use newtypes::PartnerTenantId;
use newtypes::SessionAuthToken;
use newtypes::TenantId;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct TenantLoginRequest {
    pub code: String,
    /// Optionally request to log into the provided tenant, if the user has a rolebinding at this
    /// tenant.
    pub request_org_id: Option<TenantId>,
}

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct PartnerLoginRequest {
    pub code: String,
    /// Optionally request to log into the provided tenant, if the user has a rolebinding at this
    /// tenant.
    pub request_org_id: Option<PartnerTenantId>,
}

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OrgLoginResponse {
    /// Whether a new tenant was created for the authed user
    pub created_new_tenant: bool,
    /// Whether this user has logged into this tenant before
    pub is_first_login: bool,
    /// Whether tenant onboarding is still incomplete and we need to collect more info on the tenant
    /// from the user
    pub requires_onboarding: bool,
    /// True when a `request_org_id` was provided but the user doesn't have a matching rolebinding
    /// for that org_id
    pub is_missing_requested_org: bool,
    pub auth_token: SessionAuthToken,
    pub user: OrganizationMember,
    pub tenant: Option<Organization>,
    pub partner_tenant: Option<PartnerOrganization>,
}
