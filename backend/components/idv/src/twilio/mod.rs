use newtypes::{AuditTrailEvent, IdvData, SignalAttribute, Status, Vendor, VerificationInfo};
use twilio::response::lookup::LookupV2Response;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Phone number must be provided")]
    PhoneNumberNotPopulated,
    #[error("Twilio client error: {0}")]
    Twilio(#[from] twilio::error::Error),
}

#[derive(Debug)]
pub struct Response {
    pub raw_response: LookupV2Response,
    pub status: Status,
    pub audit_events: Vec<AuditTrailEvent>,
}

pub async fn lookup_v2(client: &twilio::Client, idv_data: IdvData) -> Result<Response, Error> {
    let phone_number = if let Some(phone_number) = idv_data.phone_number {
        phone_number
    } else {
        return Err(Error::PhoneNumberNotPopulated);
    };
    // TODO scrub PII From raw_response
    let raw_response = client.lookup_v2(phone_number.leak()).await?;
    // TODO read response from twilio
    let audit_events = vec![AuditTrailEvent::Verification(VerificationInfo {
        attributes: vec![SignalAttribute::PhoneNumber],
        vendor: Vendor::Twilio,
        status: newtypes::VerificationInfoStatus::Verified,
    })];
    Ok(Response {
        raw_response,
        status: Status::Verified,
        audit_events,
    })
}
