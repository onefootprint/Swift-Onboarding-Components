use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultProxyError {
    #[error("missing $ from token start")]
    InvalidTokenStart,
    #[error("missing $ from token start")]
    InvalidTokenComponents,
    #[error("invalid data type identifier: {0}")]
    InvalidDataIdentifier(#[from] newtypes::DataIdentifierParsingError),
    #[error("found invalid or unknown data identifiers: {0}")]
    DataIdentifiersNotFound(String),
    #[error("destination target url is an invalid url")]
    InvalidDestinationUrl,
    #[error("destination target must be HTTPS in live-mode")]
    DestinationMustBeHttps,
}
