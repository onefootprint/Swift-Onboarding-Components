use thiserror::Error;

use self::session_data::user::UserAuthScope;

pub mod either;
pub mod key_context;
pub mod session_context;
pub mod session_data;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("unknown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientPublicAuthHeader,
    #[error("missing X-Client-Secret-Key")]
    MissingClientSecretAuthHeader,
    #[error("missing X-Fpuser-Authorization")]
    MissingFpuserAuthHeader,
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
    #[error("unauthorized operation")]
    UnauthorizedOperation,
    #[error("session expired")]
    SessionExpired,
    #[error("invalid token for header {0}")]
    InvalidTokenForHeader(String),
    #[error("not allowed: restricted to sandbox mode")]
    SandboxRestricted,
    #[error("Not allowed: requires one of the following scopes: {0:?}")]
    MissingScope(Vec<UserAuthScope>),
}

/// A helper trait to extract whether the auth session is for sandbox or production data
pub trait IsLive {
    fn is_live(&self) -> Result<bool, AuthError>;
}

pub trait SupportsIsLiveHeader {}
