use std::fmt::Debug;

use ::twilio::response::lookup::LookupV2Response;
use idology::verification::IDologyResponse;
use newtypes::Vendor;

pub mod idology;
pub mod test_fixtures;
pub mod twilio;

#[allow(clippy::large_enum_variant)]
#[derive(Clone)]
pub enum ParsedResponse {
    IDology(IDologyResponse),
    Twilio(LookupV2Response),
}

impl ParsedResponse {
    pub fn from_idology_expectid_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::idology::verification::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::IDology(parsed))
    }

    pub fn from_twilio_lookupv2_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = ::twilio::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::Twilio(parsed))
    }
}

#[derive(Clone)]
pub struct VendorResponse {
    pub vendor: Vendor,
    pub response: ParsedResponse,
    pub raw_response: serde_json::Value,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("IDology error: {0}")]
    IDologyError(#[from] idology::Error),
    #[error("Twilio error: {0}")]
    TwilioRequestError(#[from] ::twilio::error::Error),
    #[error("Twilio error: {0}")]
    TwilioError(#[from] twilio::Error),
    #[error("Not implemented")]
    NotImplemented,
}
