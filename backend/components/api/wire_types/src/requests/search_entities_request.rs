use newtypes::{
    input::deserialize_stringified_list, ExternalId, LabelKind, ObConfigurationId, OnboardingStatusFilter,
    PiiString, VaultKind,
};

use crate::*;

#[derive(Default, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct SearchEntitiesRequest {
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
    pub has_outstanding_workflow_request: Option<bool>,
    #[serde(default)]
    pub labels: Vec<LabelKind>,
    pub playbook_ids: Option<Vec<ObConfigurationId>>,
}

#[derive(Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct SearchUsersRequest {
    /// Deprecated
    #[openapi(skip)]
    pub search: Option<PiiString>,
    /// Filter users by an external id
    pub external_id: Option<ExternalId>,
}

#[derive(Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ModernSearchRequest {
    /// Filter users by an external id
    pub external_id: Option<ExternalId>,
}
