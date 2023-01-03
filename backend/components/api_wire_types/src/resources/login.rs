use crate::*;

#[derive(serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct OrgLoginRequest {
    pub code: String,
}

export_schema!(OrgLoginRequest);

#[derive(serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OrgLoginResponse {
    pub created_new_tenant: bool,
    pub requires_onboarding: bool,
    /// If the email is associated with one tenant, a long-lived TenantUserAuth token to perform
    /// actions on the dashboard.
    /// If the email is associated with multiple tenants, a a short-lived WorkOsAuth token that
    /// can be used to select the tenant as which to auth.
    pub auth_token: SessionAuthToken,
    /// Populated when we have logged into a TenantUser
    pub user: Option<OrganizationMember>,
    pub tenant: Option<Organization>,
}

export_schema!(OrgLoginResponse);
