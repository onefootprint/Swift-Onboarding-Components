use serde::de::DeserializeOwned;

use crate::error::Error;

use self::lookup::LookupV2Response;

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

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> std::result::Result<LookupV2Response, serde_json::Error> {
    let response: LookupV2Response = serde_json::value::from_value(value)?;
    Ok(response)
}
