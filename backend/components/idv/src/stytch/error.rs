use super::response::StytchErrorResponse;
use newtypes::PiiJsonValue;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use std::fmt::Debug;
use strum::Display;
use strum_macros::EnumString;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("Stytch reqwest error: {0} http status: {1}")]
    ReqwestErrorWithCode(reqwest::Error, u16),
    #[error("Stytch http error {0}")]
    HttpError(u16),
    #[error("error sending request to fingerprint js api: {0}")]
    RequestError(String),
    #[error("Stytch error response: {0:?}")]
    StytchError(StytchErrorResponse),
}

#[derive(Clone, Debug, Display, EnumString, SerializeDisplay, DeserializeFromStr, Eq, PartialEq)]
pub enum StytchError {
    #[strum(serialize = "The telemety_id was not found.")]
    TelemetryIdNotFound,
    #[strum(default)]
    Unknown(String),
}

// TODO: lots of repeated code needed to do this for every vendor
pub struct ErrorWithResponse {
    pub error: Error,
    pub response: PiiJsonValue,
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
