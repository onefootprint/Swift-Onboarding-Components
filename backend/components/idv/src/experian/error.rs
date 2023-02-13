#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("Serde Json error {0}")]
    SerdeJsonError(#[from] serde_json::Error),
    #[error("error sending request to experian api: {0}")]
    SendError(String),
}
