use chrono::{
    DateTime,
    Utc,
};
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OrgMetrics {
    /// All vaults created, whether or not they've been through KYC
    pub new_user_vaults: i64,
    /// All onboardings created
    pub total_user_onboardings: i64,
    pub successful_user_onboardings: i64,
    pub failed_user_onboardings: i64,
    pub incomplete_user_onboardings: i64,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]

pub struct OrgMetricsRequest {
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub playbook_id: Option<ObConfigurationId>,
}
