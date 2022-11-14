use thiserror::Error;

#[derive(Debug, Error)]
pub enum TenantError {
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Cannot deactivate the currently logged-in user")]
    CannotDeactivateCurrentUser,
    #[error("Tenant user does not exist")]
    TenantUserDoesNotExist,
}
