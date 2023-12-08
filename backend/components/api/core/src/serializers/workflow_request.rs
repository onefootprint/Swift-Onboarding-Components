use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use newtypes::TriggerKind;
use newtypes::WorkflowKind;

use crate::utils::db2api::DbToApi;

// Used to serialize a workflow as used in the user timeline events
impl DbToApi<Workflow> for api_wire_types::TriggeredWorkflow {
    fn from_db(wc: Workflow) -> Self {
        let Workflow { kind: wf_kind, .. } = wc;

        // The API-visible types of triggers are slightly different than our internal workflow kinds.
        // Here, we map to the correct API-visible kind
        let kind = match wf_kind {
            WorkflowKind::AlpacaKyc | WorkflowKind::Kyc => TriggerKind::RedoKyc,
            WorkflowKind::Document => TriggerKind::IdDocument,
            // This never happens
            WorkflowKind::Kyb => TriggerKind::RedoKyc,
        };
        Self { kind }
    }
}

impl DbToApi<WorkflowRequest> for api_wire_types::WorkflowRequest {
    fn from_db(wfr: WorkflowRequest) -> Self {
        let WorkflowRequest {
            id, deactivated_at, ..
        } = wfr;

        Self {
            id,
            is_deactivated: deactivated_at.is_some(),
        }
    }
}
