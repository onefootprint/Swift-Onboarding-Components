use newtypes::ValidatedPhoneNumber;

use self::client::IdologyApiError;

pub mod client;
mod conversion;

#[derive(Debug, thiserror::Error)]
pub enum IdologyError {
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] IdologyConversionError),
    #[error("internal reqwest error: {0}")]
    InernalReqwestError(#[from] IdologyReqwestError),
    // TODO: don't show this
    #[error("error from idology api: {0}")]
    IdologyErrorResponse(IdologyApiError),
}

#[derive(Debug, thiserror::Error)]
pub enum IdologyConversionError {
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
    #[error("phone number must be 10 digits")]
    UnsupportedPhoneNumber(ValidatedPhoneNumber),
    #[error("unsupported country, country must be US")]
    UnsupportedCountry(String),
}

#[derive(Debug, thiserror::Error)]
pub enum IdologyReqwestError {
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    ReqwestSendError(String),
}
