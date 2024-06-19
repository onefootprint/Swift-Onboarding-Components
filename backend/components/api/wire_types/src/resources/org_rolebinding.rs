use crate::*;

/// A role tied to a user that gives them their permissions
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct OrganizationRolebinding {
    pub last_login_at: Option<DateTime<Utc>>,
}
