use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to comply advantage api: {0}")]
    SendError(String),
    #[error("Conversion Error {0}")]
    ConversionError(#[from] ConversionError),
    #[error("Reqwest error {0}")]
    ReqwestError(#[from] reqwest::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("First name must be provided")]
    MissingFirstName,
    #[error("Last name must be provided")]
    MissingLastName,
}
