use crate::*;

/// Describes the severity of of a risk signal
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub enum RiskSeverity {
    Info,
    Low,
    Medium,
    High,
}

export_schema!(RiskSeverity);
