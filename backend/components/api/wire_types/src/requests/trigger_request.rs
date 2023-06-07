use crate::*;

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum TriggerKind {
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    RedoKyc,
    /// Upload a new document and re-run the decision engine
    IdDocument,
    // TODO in the future, support BusinessOwnerLink, FinishKyc?, EditData?
}

export_schema!(TriggerKind);

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerRequest {
    pub kind: TriggerKind,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

export_schema!(TriggerRequest);
