use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct User {
    pub footprint_user_id: FootprintUserId,
    pub identity_data_attributes: Vec<DataAttribute>,
    pub start_timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub requirements: Vec<Requirement>,
    pub onboardings: Vec<Onboarding>,
    pub decisions: Vec<Decision>,
    pub is_portable: bool,
}

export_schema!(User);
