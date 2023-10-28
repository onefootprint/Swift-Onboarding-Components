use newtypes::input::deserialize_stringified_list;

use crate::*;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ListEntitiesRequest {
    pub kind: Option<VaultKind>,
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    pub statuses: Vec<OnboardingStatusFilter>,
    pub requires_manual_review: Option<bool>,
    pub watchlist_hit: Option<bool>,
    pub search: Option<PiiString>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    /// When true, shows hidden incomplete vaults that didn't complete a signup challenge
    pub show_all: Option<bool>,
    pub is_created_via_api: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct SearchUsersRequest {
    pub search: Option<PiiString>,
}
