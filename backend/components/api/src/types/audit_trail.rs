use chrono::{DateTime, Utc};
use db::models::{audit_trail::AuditTrail, verification_result::VerificationResult};
use newtypes::AuditTrailEvent;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct FpAuditTrail {
    pub event: AuditTrailEvent,
    pub verification_result: Option<serde_json::Value>,
    pub timestamp: DateTime<Utc>,
}

impl From<(AuditTrail, Option<VerificationResult>)> for FpAuditTrail {
    fn from(s: (AuditTrail, Option<VerificationResult>)) -> Self {
        let AuditTrail { event, timestamp, .. } = s.0;
        FpAuditTrail {
            event,
            timestamp,
            verification_result: s.1.map(|r| r.response),
        }
    }
}
