use crate::{export_schema, Apiv2Schema, JsonSchema, Serialize, TriggerKind};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct Workflow {
    pub kind: TriggerKind,
}

export_schema!(Workflow);
