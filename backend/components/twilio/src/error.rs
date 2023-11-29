use crate::response::message::Status;
use std::fmt::Display;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("{0}")]
    ReqwestMiddleware(#[from] reqwest_middleware::Error),
    #[error("{0}")]
    Request(#[from] reqwest::Error),
    #[error("Message delivery failed. Please try resending the message.")]
    DeliveryFailed(Status, Option<i64>),
    #[error("Message unable to be delivered. Please try resending the message or use a different phone number.")]
    NotDeliveredAfterTimeout(Status, Option<i64>),
    #[error("{0}")]
    Api(ApiErrorResponse),
    #[error("{0}")]
    SerdeJson(#[from] serde_json::Error),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Error)]
pub struct ApiErrorResponse {
    pub code: i64,
    pub message: String,
    pub more_info: String,
    pub status: u16,
}

impl Display for ApiErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}

impl Error {
    pub fn message(&self) -> String {
        match self {
            Self::DeliveryFailed(_, error_code) | Self::NotDeliveredAfterTimeout(_, error_code) => {
                // Try attaching specific context from the error code received by twilio, if any
                let generic_err = self.to_string();
                let specific_err = error_code.and_then(error_description);
                if let Some(specific_err) = specific_err {
                    format!("{} {}", generic_err, specific_err)
                } else {
                    generic_err
                }
            }
            _ => self.to_string(),
        }
    }
}

/// Human-readable tips on how to avoid common twilio error codes
fn error_description(twlio_error_code: i64) -> Option<&'static str> {
    let message = match twlio_error_code {
        30003 => {
            "Please make sure the recipient is powered on, can receive SMS messages, and has sufficient signal."
        }
        30004 => {
            "Please make sure the recipient is not blocking SMS messages."
        }
        30005 => {
            "Please make sure the recipient exists, can receive SMS messages, and has sufficient signal."
        }
        30006 => {
            "Please make sure the recipient is not a landline and can receive SMS messages."
        }
        _ => return None,
    };
    Some(message)
}
