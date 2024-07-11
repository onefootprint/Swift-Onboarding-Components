use chrono::DateTime;
use chrono::Utc;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct OrgMetricsResponse {
    pub user: OrgMetrics,
    pub business: OrgMetrics,
}

#[derive(Debug, Clone, Serialize, Apiv2Response)]
pub struct OrgMetrics {
    /// All vaults created, whether or not they've been through KYC
    pub new_vaults: i64,
    /// All onboardings created
    pub total_onboardings: i64,
    pub pass_onboardings: i64,
    pub fail_onboardings: i64,
    pub incomplete_onboardings: i64,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]

pub struct OrgMetricsRequest {
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub playbook_id: Option<ObConfigurationId>,
}
