use thiserror::Error;

#[derive(Debug, Error)]
pub enum HandoffError {
    #[error("Cannot find handoff session")]
    HandoffSessionNotFound,
}
