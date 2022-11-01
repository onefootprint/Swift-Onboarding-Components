use newtypes::csv::deserialize_stringified_list;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct RiskSignalFilters {
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    pub scope: Vec<SignalScope>,
    pub description: Option<String>,
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    pub severity: Vec<SignalSeverity>,
}

export_schema!(RiskSignalFilters);
