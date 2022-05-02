use thiserror::Error;
pub mod client_public_key;
pub mod onboarding_session;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Unkown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientAuthHeader,
    #[error("missing X-Onboarding-Session-Token")]
    MissingOnboardingSessionToken,
    #[error("error reading session: {0}")]
    SessionError(#[from] actix_web::Error),
    #[error("invalid json {0}")]
    InvalidSessionJson(serde_json::Error),
}
