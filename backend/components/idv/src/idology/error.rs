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
    #[error("Could not parse error code: {0}")]
    UnknownError(String),
    #[error("Could not parse response status: {0}")]
    UnknownResponseStatus(String),
    #[error("No status found on the response")]
    NoStatusFound,
    #[error("Missing reference id for request")]
    MissingReferenceId,
    #[error("Document results are not ready")]
    DocumentResultsNotReady,
}

impl Error {
    pub fn should_retry_request(&self) -> bool {
        matches!(&self, Error::DocumentResultsNotReady | Error::ReqwestError(_))
    }
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

// Errors we may get
// https://web.idologylive.com/api_portal.php#error-messages-subtitle-error-messages-scan-verify
#[derive(PartialEq, Eq, Clone, Debug)]
pub enum RequestError {
    // There is an issue with the username/password submitted.
    InvalidUserNameOrPassword,
    // The submitted image doesn't contain characters found within base64 encoding for front image.
    InvalidImageFront,
    // The submitted image doesn't contain characters found within base64 encoding for front image.
    InvalidImageBack,
    // The base64 received for 'faceImage' is exactly the same as the 'image'.
    ImageSameAsDocumentImage,
    // This result may be returned for any of the following reasons:
    //  - The entire request with all images exceeds 17MB (too large).
    //  - Invalid or malformed Request Parameters.
    //  - Missing Request Parameters.
    //  - Invalid or malformed image string(s).
    //  - Image strings are not URL MIME encoded.
    NullArguments,
    // The IP Address is not white-listed by IDology.
    IpAddressNotRegistered,
    // The query_id/reference_number/id_number sent to ScanVerify is not valid.
    // This usually means Idology wasn't expecting to receive a document
    InvalidTransactionRequest,
    // Catchall
    UnknownError(String),
}

// Note: We don't use strum here because the IP Address error str is amenable
// to change if the full string changes (which includes Idology's phone number and email address)
impl From<String> for RequestError {
    fn from(s: String) -> Self {
        match s.as_str() {
            "Invalid Username or Password" => Self::InvalidUserNameOrPassword,
            "Invalid Image Front" => Self::InvalidImageFront,
            "Invalid Image Back" => Self::InvalidImageBack,
            "Image same as Document Image" => Self::ImageSameAsDocumentImage,
            "Invalid Transaction Request" => Self::InvalidTransactionRequest,
            "Null arguments" => Self::NullArguments,
            s => {
                if s.starts_with("Your IP Address is not registered") {
                    Self::IpAddressNotRegistered
                } else {
                    Self::UnknownError(s.into())
                }
            }
        }
    }
}
