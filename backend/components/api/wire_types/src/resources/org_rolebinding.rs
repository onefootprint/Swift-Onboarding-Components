use crate::*;

/// A role tied to a user that gives them their permissions
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct OrganizationRolebinding {
    pub last_login_at: Option<DateTime<Utc>>,
}

export_schema!(OrganizationRolebinding);
