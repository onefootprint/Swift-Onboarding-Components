use levenshtein::levenshtein;
use newtypes::{AuditTrailEvent, IdvData, SignalScope, Vendor, VerificationInfo};

use crate::IdvResponse;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Phone number must be provided")]
    PhoneNumberNotPopulated,
    #[error("Twilio client error: {0}")]
    Twilio(#[from] twilio::error::Error),
    #[error("Json error: {0}")]
    JsonError(#[from] serde_json::Error),
}

pub async fn lookup_v2(client: &twilio::Client, idv_data: IdvData) -> Result<IdvResponse, Error> {
    let phone_number = if let Some(ref phone_number) = idv_data.phone_number {
        phone_number
    } else {
        return Err(Error::PhoneNumberNotPopulated);
    };
    let mut response = client.lookup_v2(phone_number.leak()).await?;

    let name_str_distance = if let Some((caller_name, name)) = response
        .caller_name
        .as_ref()
        .and_then(|x| x.caller_name.as_ref())
        .and_then(|caller_name| idv_data.name().map(|name| (caller_name, name)))
    {
        // TODO more detail here - maybe like distance for first name + last name independently
        let name = name.to_uppercase();
        let caller_name = caller_name.leak().to_uppercase();
        let str_distance = levenshtein(name.as_str(), caller_name.as_str());
        Some(str_distance)
    } else {
        None
    };
    response.name_str_distance = name_str_distance;

    let raw_response = serde_json::value::to_value(response)?;

    // TODO read response from twilio
    let audit_events = vec![AuditTrailEvent::Verification(VerificationInfo {
        attributes: vec![SignalScope::PhoneNumber],
        vendor: Vendor::Twilio,
        status: newtypes::VerificationInfoStatus::Verified,
    })];
    Ok(IdvResponse {
        status: None,
        audit_events,
        raw_response,
    })
}
