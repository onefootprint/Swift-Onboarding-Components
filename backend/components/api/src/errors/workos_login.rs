use thiserror::Error;

#[derive(Debug, Error)]
pub enum WorkOsLoginError {
    #[error("workos authorization url error: {0}")]
    AuthorizationUrlError(#[from] url::ParseError),
    #[error("workos profile not associated with client")]
    ProfileInvalid,
}
