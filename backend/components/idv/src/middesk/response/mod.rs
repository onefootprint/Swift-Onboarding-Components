pub mod business;
pub mod webhook;
use self::business::BusinessResponse;
use super::{
    Error,
    MiddeskReqwestError,
};
use serde::de::DeserializeOwned;
use std::fmt;

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T, Error> {
    let status = response.status();
    if status.is_success() {
        Ok(response.json().await.map_err(MiddeskReqwestError::from)?)
    } else {
        let text = response.text().await.map_err(MiddeskReqwestError::from)?;
        let api_error_response =
            serde_json::from_str::<MiddeskApiErrorResponse>(&text).map(Error::MiddeskErrorResponse);
        Err(api_error_response.unwrap_or(Error::MiddeskUnknownError(status, text)))
    }
}

pub fn parse_response(value: serde_json::Value) -> Result<BusinessResponse, Error> {
    let response: BusinessResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Error)]
pub struct MiddeskApiErrorResponse {
    pub errors: Vec<ApiErrorResponseError>,
}

impl fmt::Display for MiddeskApiErrorResponse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize)]
pub struct ApiErrorResponseError {
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{
        json,
        Value,
    };

    #[test]
    fn test_parse_response() {
        let response_json: Value = json!(
          {
            "object": "business",
            "id": "dd16b27e-e6b7-4rf34-5454-d77e6d1b9dfe",
            "name": "Waffle House",
            "created_at": "2023-02-07T21:51:21.234Z",
            "updated_at": "2023-02-07T21:51:24.894Z",
            "status": "in_review",
          }
        );

        let _decoded_response = parse_response(response_json).expect("Failed to parse!!");
    }
}
