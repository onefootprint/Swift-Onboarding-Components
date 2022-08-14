use thiserror::Error;

#[derive(Debug, Error)]
pub enum TenantError {
    #[error("Validation error: {0}")]
    ValidationError(String),
}
