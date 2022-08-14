use thiserror::Error;

#[derive(Debug, Error)]
pub enum HandoffError {
    #[error("Cannot transition status backwards")]
    InvalidStatusTransition,
    #[error("Cannot find handoff session")]
    HandoffSessionNotFound,
}
