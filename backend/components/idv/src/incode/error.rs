use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to incode api: {0}")]
    SendError(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Unknown Error")]
    UnknownError,
    #[error("Incode API Error: {0}")]
    APIResponseError(super::response::Error),
    #[error("Assertion Error: {0}")]
    AssertionError(String),
    #[error("OCR Error: {0}")]
    OcrError(String),
    #[error("{0}")]
    StringParseError(#[from] std::num::ParseIntError),
    #[error("{0}")]
    StringParseFloatError(#[from] std::num::ParseFloatError),
    #[error("{0}")]
    ChronoParseError(#[from] chrono::ParseError),
    #[error("Results not ready")]
    ResultsNotReady,
    #[error("Request indicated real result")]
    FixtureResultMismatch,
    #[error("Input CURP was invalid")]
    InvalidCurp,
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<api_errors::FpErrorCode> {
        match self {
            Error::ResultsNotReady => Some(api_errors::FpErrorCode::IncodeResultsNotReady),
            _ => None,
        }
    }
}
