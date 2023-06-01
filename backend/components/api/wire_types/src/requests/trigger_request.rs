use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum TriggerKind {
    /// Send a link to allow editing data and re-initiating KYC
    RedoKyc,
    // TODO in the future, support BusinessOwnerLink, FinishKyc?, EditData?
}

export_schema!(TriggerKind);

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerRequest {
    // TODO we'll one day replace this will workflow information
    pub kind: TriggerKind,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

export_schema!(TriggerRequest);
