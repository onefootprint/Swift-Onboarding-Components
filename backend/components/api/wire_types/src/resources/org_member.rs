use crate::*;
use newtypes::{
    TenantScope,
    TenantUserId,
};

fn is_false(b: &bool) -> bool {
    !(*b)
}

/// Member of an organization
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct OrganizationMember {
    pub id: TenantUserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    #[serde(skip_serializing_if = "is_false")]
    pub is_firm_employee: bool,
    pub role: OrganizationRole,
    // Optional since FirmEmployee sessions don't have a rolebinding
    pub rolebinding: Option<OrganizationRolebinding>,
    pub created_at: DateTime<Utc>,
}

/// Member of an organization
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

/// Info on the currently authed user
pub struct AuthOrgMember {
    pub id: TenantUserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    #[serde(skip_serializing_if = "is_false")]
    pub is_firm_employee: bool,
    #[serde(skip_serializing_if = "is_false")]
    pub is_assumed_session: bool,
    pub scopes: Vec<TenantScope>,
    pub tenant: Organization,
}

/// Limited information about member of organization
///
/// Intended to be non-sensitive information only, that may be shared between tenants/partner
/// tenants.
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
pub struct LiteOrgMember {
    pub id: TenantUserId,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct LiteUserAndOrg {
    pub user: LiteOrgMember,
    pub org: String,
}
