use newtypes::output::Csv;
use thiserror::Error;

use self::user::UserAuthScopeDiscriminant;

pub mod custodian;
pub mod session;
pub use session::SessionContext;
mod either;
pub use self::either::Either;
pub mod tenant;
pub mod user;
pub mod protected_custodian;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Key not found")]
    ApiKeyNotFound,
    #[error("Missing X-Onboarding-Config-Key")]
    MissingClientPublicAuthHeader,
    #[error("Missing X-Footprint-Secret-Key or HttpBasicAuth")]
    MissingSecretKeyAuth,
    #[error("Missing X-Footprint-Custodian-Key")]
    MissingCustodianAuthHeader,
    #[error("Invalid X-Footprint-Custodian-Key")]
    InvalidCustodianAuthHeader,
    #[error("Invalid tenant skey or footprint user id")]
    InvalidTenantKeyOrUserId,
    #[error("Incorrect session type auth")]
    SessionTypeError,
    #[error("Session expired or does not exist")]
    NoSessionFound,
    #[error("Missing header: {0}")]
    MissingHeader(String),
    #[error("Session expired")]
    SessionExpired,
    #[error("Invalid token for header {0}")]
    InvalidTokenForHeader(String),
    #[error("Not allowed: restricted to sandbox mode")]
    SandboxRestricted,
    #[error("Not allowed: requires one of the following scopes: {0}")]
    MissingScope(Csv<UserAuthScopeDiscriminant>),
    #[error("Not allowed: required permission is missing: {0}")]
    MissingTenantPermission(String),
    #[error("Not allowed: role does not have permissions to decrypt attributes")]
    RoleMissingDecryptPermission,
    #[error("Not allowed: onboarding configuration does not have permissions to decrypt attributes: {0}")]
    ObConfigMissingDecryptPermission(String),
    #[error("Cannot modify global properties on portable user")]
    CannotModifyPortableUser,
    #[error("Not allowed: handoff tokens cannot create other handoff tokens")]
    CannotCreateMultipleHandoffTokens,
    #[error("Not allowed: user is not a firm employee")]
    NotFirmEmployee,
}
