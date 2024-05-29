use newtypes::PiiJsonValue;
use std::fmt::{
    Debug,
    Display,
};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("idology type conversion error: {0}")]
    ConversionEror(#[from] ConversionError),
    #[error("internal reqwest error: {0}")]
    ReqwestError(#[from] ReqwestError),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("Could not parse error code: {0}")]
    UnknownError(String),
    #[error("Could not parse response status: {0}")]
    UnknownResponseStatus(String),
    #[error("No status found on the response")]
    NoStatusFound,
    #[error("Missing reference id for request")]
    MissingReferenceId,
    #[error("Missing restriction struct in response")]
    MissingRestrictionField,
    #[error("Document results are not ready")]
    DocumentResultsNotReady,
    #[error("RequestError: {0}")]
    RequestError(#[from] RequestError),
    #[error("Scan Verify document submission was not successful")]
    ScanVerifyDocumentSubmissionNotSuccessful,
    #[error("Credentials for tenant not configured")]
    CredentialsNotFound,
    #[error("Parsable APIError {0}")]
    ErrorWithResponse(Box<ErrorWithResponse>),
}

impl Error {
    pub fn should_retry_request(&self) -> bool {
        matches!(&self, Error::DocumentResultsNotReady | Error::ReqwestError(_))
    }

    pub fn into_error_with_response(self, response: serde_json::Value) -> Self {
        Self::ErrorWithResponse(Box::new(ErrorWithResponse {
            error: self,
            response: response.into(),
        }))
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
    #[error("Invalid country code: must be 3 characters")]
    InvalidCountryCode,
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("{0}")]
    Error(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to idology api: {0}")]
    SendError(String),
}

// Errors we may get
// https://web.idologylive.com/api_portal.php#error-messages-subtitle-error-messages-scan-verify
#[derive(PartialEq, Eq, Clone, Debug, thiserror::Error)]
pub enum RequestError {
    #[error("Credentials are incorrect")]
    InvalidUserNameOrPassword,
    #[error("Bad front image string")]
    InvalidImageFront,
    #[error("Bad back image string")]
    InvalidImageBack,
    #[error("The base64 received for 'faceImage' is exactly the same as the 'image'.")]
    ImageSameAsDocumentImage,
    // This result may be returned for any of the following reasons:
    //  - The entire request with all images exceeds 17MB (too large).
    //  - Invalid or malformed Request Parameters.
    //  - Missing Request Parameters.
    //  - Invalid or malformed image string(s).
    //  - Image strings are not URL MIME encoded.
    #[error("Null arguments")]
    NullArguments,
    #[error("IP address not registered")]
    IpAddressNotRegistered,
    #[error("Invalid query_id/reference_number/id_number")]
    // The query_id/reference_number/id_number sent to ScanVerify is not valid.
    // This usually means Idology wasn't expecting to receive a document
    InvalidTransactionRequest,
    // Catchall
    #[error("Error: {0}")]
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

/// In the case that we have errors that get returned in a deserializable json response,
/// we still want to save these as VerificationResults.
///
/// This struct wraps `Error` so that we can propagate the json up and save.
pub struct ErrorWithResponse {
    pub error: Error,
    pub response: PiiJsonValue,
}

impl Display for ErrorWithResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

impl std::fmt::Debug for ErrorWithResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ErrorWithResponse")
            .field("error", &self.error)
            .field("response", &"<omitted>")
            .finish()
    }
}
