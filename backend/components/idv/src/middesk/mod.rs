use thiserror::Error;

pub mod client;
pub mod request;
pub mod response;
pub use derive_more::Display;

use self::response::MiddeskApiErrorResponse;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("error building reqwest client: {0}")]
    ReqwestError(#[from] MiddeskReqwestError),
    #[error("error response from middesk api: {0}")]
    MiddeskErrorResponse(#[from] MiddeskApiErrorResponse),
    #[error("unexpected error from middesk api: {0}")]
    MiddeskUnknownError(String),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("url error: {0}")]
    RequestUrlError(#[from] url::ParseError),
}

#[derive(Debug, thiserror::Error)]
pub enum MiddeskReqwestError {
    #[error("request error : {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
}
