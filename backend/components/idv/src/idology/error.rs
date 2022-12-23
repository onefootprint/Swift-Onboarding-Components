use newtypes::ValidatedPhoneNumber;
use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] ConversionError),
    #[error("internal reqwest error: {0}")]
    ReqwestError(#[from] ReqwestError),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("Request serialization error: {0}")]
    SerializationError(#[from] SerializationError),
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("First name must be provided")]
    MissingFirstName,
    #[error("Last name must be provided")]
    MissingLastName,
    #[error("Address must be provided")]
    MissingAddress,
    #[error("ReferenceId must be provided")]
    MissingReferenceId,
    #[error("Front image must be provided")]
    MissingFrontImage,
    #[error("Back image must be provided")]
    MissingBackImage,
    #[error("Country must be provided")]
    MissingCountry,
    #[error("DocumentType must be provided")]
    MissingDocumentType,
    #[error("Could not parse DOB")]
    CantParseDob,
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
    #[error("phone number must be 10 digits")]
    UnsupportedPhoneNumber(ValidatedPhoneNumber),
    #[error("unsupported country {0}, country must be US")]
    UnsupportedCountry(String),
    #[error("Invalid country code: must be 3 characters")]
    InvalidCountryCode,
    #[error("DocumentType unsupported for ScanVerify")]
    UnsupportedDocumentType,
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

#[derive(Debug, thiserror::Error)]
pub enum SerializationError {
    #[error("error serializing request: {0}")]
    UrlEncodingSerializationError(#[from] serde_urlencoded::ser::Error),
}
