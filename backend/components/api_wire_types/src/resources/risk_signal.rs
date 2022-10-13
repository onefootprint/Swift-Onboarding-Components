use crate::*;

use super::severity::Severity;

/// A risk event
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RiskSignal {
    pub id: String,
    pub level: Severity,
    pub timestamp: chrono::DateTime<Utc>,
}
export_schema!(RiskSignal);
