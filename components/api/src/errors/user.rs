use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("Sandbox data must be provided for sandbox users")]
    SandboxMismatch,
}
