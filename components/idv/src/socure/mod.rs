pub mod client;
mod conversion;

#[derive(Debug, thiserror::Error)]
pub enum SocureError {
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] SocureConversionError),
    #[error("internal reqwest error: {0}")]
    InernalReqwestError(#[from] ReqwestError),
    // TODO: don't show this
    #[error("error from socure api: {0}")]
    SocureErrorResponse(String),
}

#[derive(Debug, thiserror::Error)]
pub enum SocureConversionError {
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    ReqwestSendError(String),
}
