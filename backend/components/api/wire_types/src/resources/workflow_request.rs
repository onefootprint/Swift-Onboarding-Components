use newtypes::WorkflowRequestId;

use crate::{Apiv2Schema, Serialize, TriggerKind};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct WorkflowRequest {
    pub id: WorkflowRequestId,
    pub is_deactivated: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct TriggeredWorkflow {
    pub kind: TriggerKind,
}
