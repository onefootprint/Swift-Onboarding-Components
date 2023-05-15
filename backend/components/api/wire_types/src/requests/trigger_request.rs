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
}

export_schema!(TriggerRequest);
