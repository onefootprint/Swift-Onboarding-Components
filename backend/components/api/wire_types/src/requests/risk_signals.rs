use crate::*;
use newtypes::input::deserialize_stringified_list;
use newtypes::{
    SignalScope,
    SignalSeverity,
};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
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
