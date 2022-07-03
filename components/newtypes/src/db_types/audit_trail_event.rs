use diesel::{not_none, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{DataKind, Vendor};

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
    pub ip_address: Option<String>,
    pub location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationInfo {
    pub data_kinds: Vec<DataKind>,
    pub vendor: Vendor,
}
