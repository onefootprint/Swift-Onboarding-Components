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
    #[error("base64 encode error {0}")]
    Base64EncodeError(#[from] base64::DecodeError),
    #[error("Experian Conversion Error")]
    ConversionError(#[from] ConversionError),
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
}
