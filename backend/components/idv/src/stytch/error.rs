use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::fmt::Debug;
use strum::Display;
use strum_macros::EnumString;

use super::response::StytchErrorResponse;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
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
