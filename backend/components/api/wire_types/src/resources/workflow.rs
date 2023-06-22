use crate::{export_schema, Apiv2Schema, Deserialize, JsonSchema, Serialize, TriggerKind};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct Workflow {
    pub kind: TriggerKind,
}

export_schema!(Workflow);
