use std::fmt::Display;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("delivery failed")]
    DeliveryFailed,
    #[error("not delivered")]
    NotDelivered,
    #[error("api error: {0}")]
    Api(ApiErrorResponse),
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
