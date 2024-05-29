use super::response::StytchErrorResponse;
use newtypes::PiiJsonValue;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use std::fmt::Debug;
use strum::Display;
use strum_macros::EnumString;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error sending request to fingerprint js api: {0}")]
    RequestError(String),
    #[error("Stytch error response: {0:?}")]
    StytchError(StytchErrorResponse),
    #[error("ErrorWithResponse {0}")]
    ErrorWithResponse(Box<ErrorWithResponse>),
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

impl Error {
    pub fn into_error_with_response(self, response: serde_json::Value) -> Self {
        Self::ErrorWithResponse(Box::new(ErrorWithResponse {
            error: self,
            response: response.into(),
        }))
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
