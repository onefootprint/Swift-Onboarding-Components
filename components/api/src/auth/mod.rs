use thiserror::Error;
pub mod client_public_key;
pub mod onboarding_token;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Unkown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientAuthHeader,
    #[error("missing X-Onboarding-Session-Token")]
    MissingOnboardingSessionToken,
}
