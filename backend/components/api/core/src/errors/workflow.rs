use thiserror::Error;

#[derive(Debug, Error)]
pub enum WorkflowError {
    #[error("Onboarding cannot proceed in state {0}")]
    WorkflowCannotProceed(newtypes::WorkflowState),
}

impl api_errors::FpErrorTrait for WorkflowError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
