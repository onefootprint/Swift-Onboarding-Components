use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]

pub enum Error {
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error sending request to fingerprint js api: {0}")]
    RequestError(String),
}
