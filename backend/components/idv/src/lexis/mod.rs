pub mod client;
mod request;
pub mod response;
use serde::de::DeserializeOwned;

use self::response::FlexIDResponse;

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T, Error> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        Err(Error::Api(response.text().await?))
    }
}

pub fn parse_response(value: serde_json::Value) -> Result<FlexIDResponse, Error> {
    let response: FlexIDResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("internal reqwest error: {0}")]
    InernalReqwestError(#[from] ReqwestError),
    #[error("api error: {0}")]
    Api(String),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("lexis type conversion error: {0}")]
    ConversionEror(#[from] ConversionError),
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error sending request to lexis api: {0}")]
    ReqwestSendError(String),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("Could not parse DOB")]
    CantParseDob,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json, Value};

    #[test]
    #[ignore]
    fn test_parse_response() {
        // TODO
        let response_json: Value = json!({});

        let decoded_response = parse_response(response_json).expect("Failed to parse!!");
        println!("{:?}", decoded_response);
    }
}
