use newtypes::{ObConfigurationId, TriggerKind, WorkflowRequestId};

use crate::{Apiv2Schema, Serialize};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct WorkflowRequest {
    pub id: WorkflowRequestId,
    pub is_deactivated: bool,
    pub playbook_id: ObConfigurationId,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct TriggeredWorkflow {
    pub kind: TriggerKind,
}
