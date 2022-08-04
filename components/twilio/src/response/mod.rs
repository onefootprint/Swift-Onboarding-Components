use serde::de::DeserializeOwned;

use crate::error::Error;

pub mod lookup;
pub mod message;

pub type Result<T> = std::result::Result<T, Error>;

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> crate::response::Result<T> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        Err(Error::Api(response.json().await?))
    }
}
