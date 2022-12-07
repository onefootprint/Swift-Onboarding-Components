pub mod client;
mod conversion;
use serde::de::DeserializeOwned;
use std::fmt::Display;
use thiserror::Error;

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T, SocureError> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        Err(SocureError::Api(response.json().await?))
    }
}

pub fn parse_response(value: serde_json::Value) -> Result<SocureKycResponse, SocureError> {
    let response: SocureKycResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, thiserror::Error)]
pub enum SocureError {
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureKycResponse {
    reference_id: String,
    kyc: SocureKycData,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureKycData {
    reason_codes: Vec<String>,
    field_validations: ValidationStruct,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidationStruct {
    first_name: Option<f32>,
    sur_name: Option<f32>,
    street_address: Option<f32>,
    city: Option<f32>,
    state: Option<f32>,
    zip: Option<f32>,
    mobile_number: Option<f32>,
    dob: Option<f32>,
    ssn: Option<f32>,
}
