use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct User {
    pub id: FootprintUserId,
    pub is_portable: bool,
    pub identity_data_attributes: Vec<DataLifetimeKind>,
    pub identity_document_types: Vec<String>,
    pub start_timestamp: DateTime<Utc>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
}

export_schema!(User);
