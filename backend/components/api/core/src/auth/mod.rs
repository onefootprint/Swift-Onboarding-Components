use newtypes::output::Csv;
use thiserror::Error;

use self::user::UserAuthGuard;

pub mod custodian;
pub mod session;
pub use session::SessionContext;
mod either;
pub use self::either::Either;
mod guard;
pub mod ob_config;
pub mod protected_custodian;
pub mod tenant;
pub mod user;
pub use guard::*;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Key not found")]
    ApiKeyNotFound,
    #[error("Missing {0}")]
    MissingHeader(String),
    #[error("Invalid {0}")]
    InvalidHeader(String),
    #[error("Error loading session for header {0}")]
    ErrorLoadingSession(String, String),
    #[error("Invalid request body")]
    InvalidBody,
    #[error("Incorrect session type auth")]
    SessionTypeError,
    #[error("Session expired or does not exist")]
    NoSessionFound,
    #[error("Not allowed: restricted to sandbox mode")]
    SandboxRestricted,
    #[error("Not allowed: required permission is missing: {0}")]
    MissingUserPermission(String),
    #[error("Not allowed: requires one of the following scopes: {0}")]
    MissingScope(Csv<UserAuthGuard>),
    #[error("Not allowed: required permission is missing: {0}")]
    MissingTenantPermission(String),
    #[error("Not allowed: onboarding configuration does not have permissions to decrypt attributes: {0}")]
    ObConfigMissingDecryptPermission(String),
    #[error("Cannot modify global properties on portable user")]
    CannotModifyPortableUser,
    #[error("Not allowed: handoff tokens cannot create other handoff tokens")]
    CannotCreateMultipleHandoffTokens,
    #[error("Not allowed: user is not a firm employee")]
    NotFirmEmployee,
    #[error("Not allowed: ob config doesn't require collecting business")]
    BusinessNotRequired,
    #[error("Cannot log in as a non-portable vault")]
    NonPortableVault,
    #[error("Cannot log in as a non-person vault")]
    NonPersonVault,
}
