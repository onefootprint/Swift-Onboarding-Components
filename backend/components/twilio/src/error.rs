use crate::response::message::Status;
use std::fmt::Display;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("{0}")]
    ReqwestMiddleware(#[from] reqwest_middleware::Error),
    #[error("{0}")]
    Request(#[from] reqwest::Error),
    // TODO see if we can provide more information based on the twilio error status here
    #[error("Message delivery failed")]
    DeliveryFailed(Status, Option<i64>),
    #[error("Message unable to be delivered.")]
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
