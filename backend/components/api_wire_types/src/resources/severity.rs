use crate::*;

/// Describes the severity of of a risk signal
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub enum Severity {
    Low,
    Medium,
    High,
}

export_schema!(Severity);
