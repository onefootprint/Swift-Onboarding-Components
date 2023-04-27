use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to incode api: {0}")]
    SendError(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Incode API Error: {0}")]
    APIResponseError(super::response::Error),
}
