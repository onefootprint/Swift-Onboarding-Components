use super::cross_core::error_code::ErrorCode;
use newtypes::PiiJsonValue;
use std::fmt;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
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
    #[error("Response Error {0}")]
    ResponseError(#[from] CrossCoreResponseError),
    #[error("Error parsing response")]
    StringParseError(#[from] std::num::ParseIntError),
    #[error("Score not found when parsing precise id response")]
    ScoreNotFound,
    #[error("Missing precise ID Response")]
    MissingPreciseIDResponse,
    #[error("invalid PreciseID score received")]
    InvalidScore(String),
    #[error("Experian Validation error {0}")]
    ValidationError(#[from] ValidationError),
    #[error("ErrorWithResponse {0}")]
    ErrorWithResponse(Box<ErrorWithResponse>),
    #[error("JWT Token needs refresh")]
    JwtTokenNeedsRefresh,
    #[error("Unknown Error")]
    UnknownError,
    #[error("Unknown Precise ID Error 720")]
    OtherPreciseIdServerError,
    #[error("Username/Password Error")]
    UserNamePasswordError,
    #[error("Incorrect PreciseID Version (model or precise match)")]
    IncorrectPreciseIdVersion,
    #[error("Experian http error {0} for service {1}")]
    HttpError(u16, String),
}

impl Error {
    pub fn into_error_with_response(self, response: serde_json::Value) -> Self {
        Self::ErrorWithResponse(Box::new(ErrorWithResponse {
            error: self,
            response: response.into(),
        }))
    }

    pub fn is_retryable_error(&self) -> bool {
        match self {
            Error::JwtTokenNeedsRefresh
            | Error::UnknownError
            | Error::UserNamePasswordError
            | Error::ReqwestError(_)
            | Error::HttpError(_, _)
            | Error::OtherPreciseIdServerError => true,
            Error::InvalidHeader(_)
            | Error::SerdeJsonError(_)
            | Error::SendError(_)
            | Error::Base64EncodeError(_)
            | Error::ConversionError(_)
            | Error::ResponseError(_)
            | Error::StringParseError(_)
            | Error::ScoreNotFound
            | Error::MissingPreciseIDResponse
            | Error::InvalidScore(_)
            | Error::ValidationError(_)
            | Error::ErrorWithResponse(_)
            | Error::IncorrectPreciseIdVersion => false,
        }
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum ValidationError {
    #[error("Data cannot be sent in this environment: {0}")]
    EnvironmentMismatch(EnvironmentMismatchError),
    #[error("Experian API credentials not registered")]
    CredentialsNotRegistered,
}

pub enum ExperianAPIError {}

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

#[derive(Debug, thiserror::Error)]
pub enum CrossCoreResponseError {
    #[error("Missing preciseID response")]
    PreciseIDResponseNotFound,
    #[error("Error response code received: {0} ({1})")]
    Error(ErrorCode, String),
}

/// The following is a list of the error codes that can be returned from the Precise ID application.
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, Hash)]
pub enum ExperianErrorCode {
    /// Consumer is a minor
    #[serde(rename = "010")]
    E010,
    /// Format error
    #[serde(rename = "013")]
    E013,
    /// Information on the inquiry was reported as fraud by the consumer
    #[serde(rename = "018")]
    E018,
    /// Invalid surname
    #[serde(rename = "045")]
    E045,
    /// Current ZIP Code error
    #[serde(rename = "049")]
    E049,
    /// State legislation requires match on more identification information
    #[serde(rename = "092")]
    E092,
    /// Invalid surname
    #[serde(rename = "106")]
    E106,
    /// One or more requested reports unavailable at this time – Please resubmit later
    #[serde(rename = "258")]
    E258,
    /// Components of checkpoint system temporarily unavailable. Please resubmit
    #[serde(rename = "259")]
    E259,
    /// *** NFD temporarily unavailable. Please resubmit *** (for the NFD Only product option)
    #[serde(rename = "304")]
    E304,
    /// NFD does not process inquiries with a Colorado ZIP Code (for the NFD Only product option)
    #[serde(rename = "313")]
    E313,
    /// Not all data available for Experian Detect evaluation
    #[serde(rename = "323")]
    E323,
    /// Experian Detect temporarily unavailable
    #[serde(rename = "324")]
    E324,
    /// Precise ID system temporarily unavailable
    #[serde(rename = "352")]
    E352,
    /// Fraud Shield unavailable
    #[serde(rename = "358")]
    E358,
    /// Credit Reporting temporarily unavailable
    #[serde(rename = "362")]
    E362,
    /// Invalid preamble for this subcode
    #[serde(rename = "388")]
    E388,
    /// SSN required to access consumer’s file
    #[serde(rename = "403")]
    E403,
    /// Generation code required to access consumer’s file
    #[serde(rename = "404")]
    E404,
    /// Year of Birth require to access consumer’s file
    #[serde(rename = "405")]
    E405,
    /// Middle name require to access consumer’s file
    #[serde(rename = "406")]
    E406,
    /// Unable to standardize current address
    #[serde(rename = "407")]
    E407,
    /// Invalid street address filed
    #[serde(rename = "627")]
    E627,
    /// Current Address exceeds maximum length
    #[serde(rename = "633")]
    E633,
    /// Input validation error
    #[serde(rename = "708")]
    E708,
    /// Invalid User ID/Password
    #[serde(rename = "709")]
    E709,
    /// Session timeout (for KIQ product options only). May also be returned if the Session ID does
    /// not exist (for KIQ product responses only).
    #[serde(rename = "710")]
    E710,
    /// End User is required
    #[serde(rename = "711")]
    E711,
    ///   Precise ID system error
    #[serde(rename = "720")]
    E720,
    // TODO: Also get json not well formed R0102 in the response header, but not in the docs anywhere /shrug
}

#[derive(PartialEq, Eq)]
pub struct EnvironmentMismatchError {
    pub is_production: bool,
    pub is_test_case: bool,
}

impl fmt::Debug for EnvironmentMismatchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "is_production={}, is_test_case={}",
            self.is_production, self.is_test_case
        )
    }
}

impl fmt::Display for EnvironmentMismatchError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "is_production={}, is_test_case={}",
            self.is_production, self.is_test_case
        )
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

impl ErrorWithResponse {
    // some errors are expected since it involves input validation which experian is stingy about
    pub fn is_known_error(&self) -> bool {
        match &self.error {
            Error::ResponseError(CrossCoreResponseError::Error(err, _)) => match err {
                ErrorCode::ConsumerIsMinor
                | ErrorCode::FormatError
                | ErrorCode::InformationOnInquiryReportedAsFraudByConsumer
                | ErrorCode::InvalidSurname
                | ErrorCode::CurrentZipCodeError
                | ErrorCode::StateRequiresMoreInfoForMatch
                | ErrorCode::InputValidationError
                | ErrorCode::SsnRequiredToAccessConsumerFile
                | ErrorCode::GenerationCodeRequiredToAccessConsumerFile
                | ErrorCode::YobRequiredToAccessConsumerFile
                | ErrorCode::MiddleNameRequiredToAccessConsumerFile
                | ErrorCode::CannotStandardizeAddress
                | ErrorCode::InvalidStreetAddressFiled
                | ErrorCode::CurrentAddressExceedsMaxLength => true,
                ErrorCode::NFDUnavailable
                | ErrorCode::NFDNotColoradoZip
                | ErrorCode::NotEnoughInfoForExperianDetect
                | ErrorCode::ExperianDetectNotAvailable
                | ErrorCode::PreciseIdNotAvailable
                | ErrorCode::FraudShieldNotAvailable
                | ErrorCode::CreditReportingNotAvailable
                | ErrorCode::InvalidPreambleForSubcode
                | ErrorCode::InvalidUserIdOrPassword
                | ErrorCode::KiqSessionTimeout
                | ErrorCode::EndUserRequired
                | ErrorCode::OtherPreciseIdError
                | ErrorCode::Other(_)
                | ErrorCode::ResubmitLater
                | ErrorCode::ResubmitCheckpointSystem => false,
            },
            _ => false,
        }
    }
}

impl std::fmt::Display for ErrorWithResponse {
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
