use crate::*;
use newtypes::{
    PartnerTenantId,
    SessionAuthToken,
    TenantId,
};

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
    /// If the email is associated with one tenant, a long-lived TenantRbAuth token to perform
    /// actions on the dashboard. If the email is associated with multiple tenants, a a
    /// short-lived WorkOsAuth token that can be used to select the tenant as which to auth.
    pub auth_token: SessionAuthToken,
    /// Populated when we have logged into a TenantUser
    pub user: Option<OrganizationMember>,
    pub tenant: Option<Organization>,
    pub partner_tenant: Option<PartnerOrganization>,
}
