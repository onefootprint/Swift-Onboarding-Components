use newtypes::{input::Csv, AuditEventName, DataIdentifier};

use crate::*;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct AuditEventRequest {
    pub names: Option<Csv<AuditEventName>>,
    pub targets: Option<Csv<DataIdentifier>>,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
}
