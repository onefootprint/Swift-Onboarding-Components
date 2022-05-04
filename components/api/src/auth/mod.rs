use thiserror::Error;
pub mod client_public_key;
pub mod identify_session;
pub mod onboarding_session;
#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Unkown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientAuthHeader,
    #[error("missing session token in cookie")]
    MissingSessionTokenCookie,
    #[error("error reading session: {0}")]
    SessionError(#[from] actix_web::Error),
    #[error("incorrect session type auth")]
    SessionTypeError,
    #[error("invalid json {0}")]
    InvalidSessionJson(serde_json::Error),
}
