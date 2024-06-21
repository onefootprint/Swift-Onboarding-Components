use thiserror::Error;

#[derive(Debug, Error)]
pub enum HandoffError {
    #[error("Cannot find handoff session")]
    HandoffSessionNotFound,
}

impl api_errors::FpErrorTrait for HandoffError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
