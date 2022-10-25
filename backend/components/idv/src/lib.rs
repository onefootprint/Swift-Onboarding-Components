use std::fmt::Debug;

use ::twilio::response::lookup::LookupV2Response;
use idology::verification::IDologyResponse;
use newtypes::{AuditTrailEvent, OnboardingStatus, Signal, SignalScope, Vendor};

pub mod idology;
pub mod twilio;

#[derive(Debug, Clone)]
pub struct IdvResponse {
    pub vendor: Vendor,
    pub status: Option<OnboardingStatus>,
    pub audit_events: Vec<AuditTrailEvent>,
    pub raw_response: serde_json::Value,
    // We parse the verification responses into signals our risk engine can use
    pub signals: Vec<Signal>,
    // These are the SignalScopes that this verification could potentially have verified
    // This is based on the data sent to the vendor
    pub verification_attributes: Vec<SignalScope>,
}

#[derive(Clone)]
pub enum ParsedResponse {
    IDology(IDologyResponse),
    Twilio(LookupV2Response),
}
#[derive(Clone)]
pub struct VendorResponse {
    pub vendor: Vendor,
    pub response: ParsedResponse,
    pub raw_response: serde_json::Value,
    // These are the SignalScopes that this verification could potentially have verified
    // This is based on the data sent to the vendor
    pub verification_attributes: Vec<SignalScope>,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("IDology error: {0}")]
    IDologyError(#[from] idology::Error),
    #[error("Twilio error: {0}")]
    TwilioError(#[from] twilio::Error),
    #[error("Not implemented")]
    NotImplemented,
}
