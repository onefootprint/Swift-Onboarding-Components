use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to samba api: {0}")]
    SendError(String),
    #[error("Samba http error {0} for service {1}")]
    HttpError(u16, String),
}
