use newtypes::IdvData;
use newtypes::PiiJsonValue;
use newtypes::TwilioLookupField;
use twilio::response::lookup::LookupV2Response;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Phone number must be provided")]
    PhoneNumberNotPopulated,
    #[error("Twilio client error: {0}")]
    Twilio(#[from] twilio::error::Error),
    #[error("Json error: {0}")]
    JsonError(#[from] serde_json::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    SendError(String),
}

pub struct TwilioLookupV2Request {
    pub idv_data: IdvData,
    pub lookup_fields: Vec<TwilioLookupField>,
}

#[derive(Clone)]
pub struct TwilioLookupV2APIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: LookupV2Response,
}
