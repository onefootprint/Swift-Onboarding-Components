use std::fmt::Debug;

use newtypes::{AuditTrailEvent, OnboardingStatus};

pub mod idology;
pub mod twilio;

#[derive(Debug)]
pub struct IdvResponse {
    pub status: Option<OnboardingStatus>,
    pub audit_events: Vec<AuditTrailEvent>,
    pub raw_response: serde_json::Value,
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
