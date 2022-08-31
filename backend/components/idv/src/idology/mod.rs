use newtypes::ValidatedPhoneNumber;
use std::fmt::Debug;

use self::client::IdologyApiError;

pub mod client;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] ConversionError),
    #[error("internal reqwest error: {0}")]
    ReqwestError(#[from] ReqwestError),
    // TODO: don't show this
    #[error("error from idology api: {0}")]
    IdologyErrorResponse(IdologyApiError),
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("First name must be provided")]
    MissingFirstName,
    #[error("Last name must be provided")]
    MissingLastName,
    #[error("Address must be provided")]
    MissingAddress,
    #[error("Could not parse DOB")]
    CantParseDob,
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
    #[error("phone number must be 10 digits")]
    UnsupportedPhoneNumber(ValidatedPhoneNumber),
    #[error("unsupported country, country must be US")]
    UnsupportedCountry(String),
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    SendError(String),
}
