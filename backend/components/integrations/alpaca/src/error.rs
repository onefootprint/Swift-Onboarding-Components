#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Invalid email address")]
    InvalidEmail,
    #[error("Invalid endpoint {0}")]
    InvalidEndpointUrl(#[from] url::ParseError),
    #[error("Reqwest error")]
    Reqwest(#[from] reqwest::Error),
    #[error("Error trying to connect to {0}")]
    ConnectionError(String),
}
