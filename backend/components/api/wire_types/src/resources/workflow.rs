use crate::{Apiv2Schema, Serialize, TriggerKind};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Workflow {
    pub kind: TriggerKind,
}
