use thiserror::Error;

use self::user::UserAuthScopeDiscriminant;

pub mod custodian;
pub mod session;
pub use session::SessionContext;
mod either;
pub use self::either::Either;
pub mod tenant;
pub mod user;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Key not found")]
    ApiKeyNotFound,
    #[error("missing X-Onboarding-Config-Key")]
    MissingClientPublicAuthHeader,
    #[error("missing X-Footprint-Secret-Key or HttpBasicAuth")]
    MissingSecretKeyAuth,
    #[error("missing X-Footprint-Custodian-Key")]
    MissingCustodianAuthHeader,
    #[error("invalid X-Footprint-Custodian-Key")]
    InvalidCustodianAuthHeader,
    #[error("invalid tenant skey or footprint user id")]
    InvalidTenantKeyOrUserId,
    #[error("incorrect session type auth")]
    SessionTypeError,
    #[error("Session expired or does not exist")]
    NoSessionFound,
    #[error("missing header: {0}")]
    MissingHeader(String),
    #[error("session expired")]
    SessionExpired,
    #[error("invalid token for header {0}")]
    InvalidTokenForHeader(String),
    #[error("not allowed: restricted to sandbox mode")]
    SandboxRestricted,
    #[error("Not allowed: requires one of the following scopes: {0:?}")]
    MissingScope(Vec<UserAuthScopeDiscriminant>),
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
}
