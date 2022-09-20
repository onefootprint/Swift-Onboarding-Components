use newtypes::TenantPermissionDiscriminants;
use thiserror::Error;

use self::session_data::user::UserAuthScope;

mod either;
pub mod key_context;
mod session_context;
pub mod session_data;
mod tenant_auth;
mod traits;
mod user_auth;

pub use self::either::Either;
pub use session_context::SessionContext;
pub use tenant_auth::WorkOsAuth;
pub use traits::*;
pub use user_auth::UserAuth;

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
    MissingScope(Vec<UserAuthScope>),
    #[error("Not allowed: required permission is missing: {0}")]
    MissingTenantPermission(TenantPermissionDiscriminants),
    #[error("Not allowed: role does not have permissions to decrypt attributes")]
    RoleMissingDecryptPermission,
    #[error("Not allowed: onboarding configuration does not have permissions to decrypt attributes")]
    ObConfigMissingDecryptPermission,
    #[error("Cannot modify global properties on portable user")]
    CannotModifyPortableUser,
}
