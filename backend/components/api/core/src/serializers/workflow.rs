use db::models::workflow::Workflow;
use newtypes::TriggerKind;
use newtypes::WorkflowKind;

use crate::utils::db2api::DbToApi;

// Used to serialize a workflow as used in the user timeline events
impl DbToApi<Workflow> for api_wire_types::Workflow {
    fn from_db(wc: Workflow) -> Self {
        let Workflow { kind: wf_kind, .. } = wc;

        // The API-visible types of triggers are slightly different than our internal workflow kinds.
        // Here, we map to the correct API-visible kind
        let kind = match wf_kind {
            WorkflowKind::AlpacaKyc | WorkflowKind::Kyc => TriggerKind::RedoKyc,
            WorkflowKind::Document => TriggerKind::IdDocument,
            WorkflowKind::Kyb => TriggerKind::RedoKyb,
        };
        api_wire_types::Workflow { kind }
    }
}
