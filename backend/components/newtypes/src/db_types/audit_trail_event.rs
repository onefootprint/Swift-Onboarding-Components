use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{SignalAttribute, Vendor};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum AuditTrailEvent {
    LivenessCheck(LivenessCheckInfo),
    Verification(VerificationInfo),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LivenessCheckInfo {
    pub attestations: Vec<String>,
    pub device: String,
    pub os: Option<String>,
    pub ip_address: Option<String>,
    pub location: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
pub enum VerificationInfoStatus {
    Verified,
    NotFound,
    Failed,
}

impl Default for VerificationInfoStatus {
    fn default() -> Self {
        Self::Verified
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationInfo {
    #[serde(default)]
    pub attributes: Vec<SignalAttribute>,
    pub vendor: Vendor,
    pub status: VerificationInfoStatus,
}
