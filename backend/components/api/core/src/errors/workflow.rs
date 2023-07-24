use thiserror::Error;

#[derive(Debug, Error)]
pub enum WorkflowError {
    #[error("Onboarding cannot proceed in state {0}")]
    WorkflowCannotProceed(newtypes::WorkflowState),
    #[error("Workflow state does not allow {0}")]
    MissingGuard(newtypes::WorkflowGuard),
    #[error("Auth missing Workflow")]
    AuthMissingWorkflow,
}
