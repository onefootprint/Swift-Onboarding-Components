use thiserror::Error;

#[derive(Debug, Error)]
pub enum HandoffError {
    #[error("Cannot transition status backwards from {0}")]
    InvalidStatusTransition(String),
    #[error("Cannot find handoff session")]
    HandoffSessionNotFound,
}
