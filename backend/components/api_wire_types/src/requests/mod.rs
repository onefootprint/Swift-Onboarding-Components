use newtypes::csv::deserialize_stringified_list;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ListUsersRequest {
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    pub statuses: Vec<KycStatus>,
    pub fingerprint: Option<PiiString>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
}

export_schema!(ListUsersRequest);
