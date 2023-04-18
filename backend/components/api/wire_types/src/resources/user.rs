use crate::*;

/// Newly created user
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct NewUser {
    pub id: FpId,
}

export_schema!(NewUser);

/// Details for a specific User
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct User {
    pub id: FpId,
    pub is_portable: bool,
    /// The list of attributes populated on this user vault.
    pub attributes: Vec<DataIdentifier>,
    pub start_timestamp: DateTime<Utc>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
}

export_schema!(User);
