use crate::*;

/// Describes the severity of of a risk signal
#[derive(Debug, Clone, Serialize, Apiv2Schema, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskSeverity {
    Info,
    Low,
    Medium,
    High,
}
