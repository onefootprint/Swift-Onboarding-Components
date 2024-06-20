use crate::ParsedResponse;
use crate::VendorResponse;
use newtypes::IdvData;
use newtypes::PiiJsonValue;
use twilio::response::lookup::LookupV2Response;
use twilio::response::parse_response;

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
}

#[derive(Clone)]
pub struct TwilioLookupV2APIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: LookupV2Response,
}

pub async fn lookup_v2(client: &twilio::Client, idv_data: IdvData) -> Result<VendorResponse, Error> {
    let phone_number = if let Some(ref phone_number) = idv_data.phone_number {
        phone_number
    } else {
        return Err(Error::PhoneNumberNotPopulated);
    };
    let response = client.lookup_v2(phone_number.leak()).await?;
    let parsed = parse_response(response.clone())?;

    Ok(VendorResponse {
        response: ParsedResponse::TwilioLookupV2(parsed),
        raw_response: response.into(),
    })
}
