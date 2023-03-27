use newtypes::D2pSessionStatus;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum HandoffError {
    #[error("Cannot transition status backwards from {0}")]
    InvalidStatusTransition(D2pSessionStatus),
    #[error("Cannot find handoff session")]
    HandoffSessionNotFound,
}
