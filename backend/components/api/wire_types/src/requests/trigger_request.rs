use crate::*;

export_schema!(TriggerInfo);

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerRequest {
    pub trigger: TriggerInfo,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

export_schema!(TriggerRequest);
