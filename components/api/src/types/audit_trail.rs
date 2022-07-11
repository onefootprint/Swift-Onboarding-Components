use chrono::{DateTime, Utc};
use db::models::audit_trails::AuditTrail;
use newtypes::AuditTrailEvent;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiAuditTrail {
    pub event: AuditTrailEvent,
    pub timestamp: DateTime<Utc>,
}

impl From<AuditTrail> for ApiAuditTrail {
    fn from(s: AuditTrail) -> Self {
        let AuditTrail { event, timestamp, .. } = s;
        ApiAuditTrail { event, timestamp }
    }
}
