use newtypes::{IdvData, Vendor};
use twilio::response::parse_response;

use crate::{ParsedResponse, VendorResponse};

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
    #[error("error building reqwest client: {0}")]
    InternalError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    SendError(String),
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
        vendor: Vendor::Twilio,
        response: ParsedResponse::Twilio(parsed),
        raw_response: response,
    })
}
