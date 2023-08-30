use thiserror::Error;

#[derive(Debug, Error)]
pub enum WorkflowError {
    #[error("Onboarding cannot proceed in state {0}")]
    WorkflowCannotProceed(newtypes::WorkflowState),
}
