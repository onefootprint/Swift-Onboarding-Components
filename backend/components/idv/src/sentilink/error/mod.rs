use error_code::SentilinkErrorCode;

pub mod error_code;


#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Sentilink reqwest middleware error: {0}")]
    ReqwestMiddlewareError(#[from] reqwest_middleware::Error),
    #[error("Sentilink reqwest error: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("Sentilink http error {0}")]
    HttpError(u16),
    #[error("Sentilink error received {0}")]
    ErrorCode(SentilinkErrorCode),
    #[error("Sentilink unknown error")]
    UnknownError(String),
}
