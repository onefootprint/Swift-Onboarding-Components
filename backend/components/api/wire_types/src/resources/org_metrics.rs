use chrono::{DateTime, Utc};
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OrgMetrics {
    /// All vaults created, whether or not they've been through KYC
    pub new_user_vaults: i64,
    /// All onboardings created
    pub total_user_onboardings: i64,
    pub successful_user_onboardings: i64,
    pub failed_user_onboardings: i64,
    pub incomplete_user_onboardings: i64,
    pub start_timestamp: DateTime<Utc>,
}
