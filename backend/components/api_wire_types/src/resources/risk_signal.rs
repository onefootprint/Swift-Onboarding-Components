use crate::*;

/// A risk event
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub decision_id: DecisionId,
    pub reason_code: String,
    pub note: String,
    pub severity: RiskSeverity,
    pub vendors: Vec<Vendor>,
    pub timestamp: chrono::DateTime<Utc>,
}
export_schema!(RiskSignal);
