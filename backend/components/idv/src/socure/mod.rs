pub mod client;
mod conversion;
use newtypes::{IdvData, Vendor};
pub mod requirements;
pub mod response;
use serde::de::DeserializeOwned;
use std::fmt::Display;
use thiserror::Error;

use crate::{ParsedResponse, VendorResponse};

use self::{client::SocureClient, response::SocureIDPlusResponse};

pub async fn send_idplus_request(
    socure_client: &SocureClient,
    idv_data: IdvData,
    device_session_id: Option<String>,
) -> Result<VendorResponse, Error> {
    let response = socure_client.idplus(idv_data, device_session_id).await?;
    let parsed_response = parse_response(response.clone())?;

    Ok(VendorResponse {
        vendor: Vendor::Socure,
        response: ParsedResponse::Socure(parsed_response),
        raw_response: response,
    })
}

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T, Error> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        Err(Error::Api(response.json().await?))
    }
}

pub fn parse_response(value: serde_json::Value) -> Result<SocureIDPlusResponse, Error> {
    let response: SocureIDPlusResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] SocureConversionError),
    #[error("internal reqwest error: {0}")]
    InernalReqwestError(#[from] SocureReqwestError),
    // TODO: don't show this
    #[error("error from socure api: {0}")]
    SocureErrorResponse(String),
    #[error("api error: {0}")]
    Api(ApiErrorResponse),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Error)]
#[serde(rename_all = "camelCase")]
pub struct ApiErrorResponse {
    pub status: Option<String>,
    pub reference_id: String,
    pub data: Option<serde_json::Value>, // can be an array or an object
    pub msg: String,
}

impl Display for ApiErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.msg)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SocureConversionError {
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
    #[error("address not present for user")]
    NoAddressPresent,
    #[error("First name must be provided")]
    MissingFirstName,
    #[error("Last name must be provided")]
    MissingLastName,
    #[error("Last name must be provided")]
    MissingCountry,
    #[error("Could not parse DOB")]
    CantParseDob,
}

#[derive(Debug, thiserror::Error)]
pub enum SocureReqwestError {
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    ReqwestSendError(String),
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json, Value};

    #[test]
    fn test_parse_response() {
        let response_json: Value = json!({
            "referenceId": "b8f0508f-1600-48f0-aad9-b7f7afbec318",
            "nameAddressCorrelation": {
              "reasonCodes": [
                "I709",
                "I710",
                "I708"
              ],
              "score": 0.99
            },
            "nameEmailCorrelation": {
              "reasonCodes": [
                "I556",
                "I557",
                "I558"
              ],
              "score": 0.99
            },
            "namePhoneCorrelation": {
              "reasonCodes": [
                "I618",
                "I621",
                "I622"
              ],
              "score": 0.99
            },
            "fraud": {
              "reasonCodes": [
                "I553",
                "I121",
                "I127"
              ],
              "scores": [
                {
                  "name": "sigma",
                  "version": "3.0",
                  "score": 0.488
                }
              ]
            },
            "kyc": {
              "reasonCodes": [
                "I919"
              ],
              "fieldValidations": {
                "firstName": 0.99,
                "surName": 0.99,
                "streetAddress": 0.99,
                "city": 0.99,
                "state": 0.99,
                "zip": 0.99,
                "mobileNumber": 0.99,
                "dob": 0.99,
                "ssn": 0.99
              }
            },
            "addressRisk": {
              "reasonCodes": [
                "I707",
                "I704",
                "I708"
              ],
              "score": 0.01
            },
            "emailRisk": {
              "reasonCodes": [
                "I520",
                "I555"
              ],
              "score": 0.01
            },
            "phoneRisk": {
              "reasonCodes": [
                "I620",
                "I611",
                "I602"
              ],
              "score": 0.01
            },
            "alertList": {
              "reasonCodes": [],
              "matches": []
            },
            "globalWatchlist": {
              "reasonCodes": [
                "I196"
              ],
              "matches": {}
            }
          }
        );

        let decoded_response = parse_response(response_json).expect("Failed to parse!!");
        println!("{:?}", decoded_response);
    }
    //decode_response
}
