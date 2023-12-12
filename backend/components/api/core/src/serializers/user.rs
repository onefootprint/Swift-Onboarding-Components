use crate::utils::db2api::DbToApi;
use db::models::{
    manual_review::ManualReview, scoped_vault::ScopedVault, vault::Vault, workflow_request::WorkflowRequest,
};

impl DbToApi<(ScopedVault, Vault)> for api_wire_types::LiteUser {
    fn from_db((sv, vault): (ScopedVault, Vault)) -> Self {
        let ScopedVault {
            fp_id, external_id, ..
        } = sv;
        let Vault { sandbox_id, .. } = vault;

        Self {
            id: fp_id,
            sandbox_id,
            external_id,
        }
    }
}

impl DbToApi<(ScopedVault, Vec<ManualReview>, Option<WorkflowRequest>)> for api_wire_types::User {
    fn from_db((sv, manual_reviews, wfr): (ScopedVault, Vec<ManualReview>, Option<WorkflowRequest>)) -> Self {
        Self {
            id: sv.fp_id,
            status: sv.status,
            requires_manual_review: !manual_reviews.is_empty(),
            external_id: sv.external_id,
            info_requested: wfr.map(api_wire_types::PublicWorkflowRequest::from_db),
        }
    }
}

impl DbToApi<WorkflowRequest> for api_wire_types::PublicWorkflowRequest {
    fn from_db(target: WorkflowRequest) -> Self {
        let WorkflowRequest { note, .. } = target;
        Self { note }
    }
}
