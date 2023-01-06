use std::fmt::Debug;

use ::twilio::response::lookup::LookupV2Response;
use idology::expectid::response::ExpectIDAPIResponse;
use idology::scan_onboarding::response::ScanOnboardingAPIResponse;
use idology::scan_verify::response::{ScanVerifyAPIResponse, ScanVerifySubmissionAPIResponse};
use newtypes::Vendor;
use socure::response::SocureIDPlusResponse;

pub mod idology;
pub mod lexis;
pub mod socure;
pub mod test_fixtures;
pub mod twilio;

#[allow(clippy::large_enum_variant)]
#[derive(Clone)]
pub enum ParsedResponse {
    IDologyExpectID(ExpectIDAPIResponse),
    IDologyScanVerifyResult(ScanVerifyAPIResponse),
    IDologyScanVerifySubmission(ScanVerifySubmissionAPIResponse),
    IDologyScanOnboarding(ScanOnboardingAPIResponse),
    TwilioLookupV2(LookupV2Response),
    SocureIDPlus(SocureIDPlusResponse),
}

impl ParsedResponse {
    pub fn from_idology_expectid_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::idology::expectid::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::IDologyExpectID(parsed))
    }

    pub fn from_twilio_lookupv2_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = ::twilio::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::TwilioLookupV2(parsed))
    }

    pub fn from_socure_idplus_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::socure::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::SocureIDPlus(parsed))
    }

    pub fn from_idology_scan_verify_results(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed =
            crate::idology::scan_verify::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::IDologyScanVerifyResult(parsed))
    }

    pub fn from_idology_scan_verify_submission(
        raw_response: serde_json::Value,
    ) -> Result<Self, crate::Error> {
        let parsed = crate::idology::scan_verify::response::parse_submission_response(raw_response)
            .map_err(Error::from)?;

        Ok(Self::IDologyScanVerifySubmission(parsed))
    }

    pub fn from_idology_scan_onboarding(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed =
            crate::idology::scan_onboarding::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::IDologyScanOnboarding(parsed))
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
    IDologyError(#[from] idology::error::Error),
    #[error("Twilio error: {0}")]
    TwilioRequestError(#[from] ::twilio::error::Error),
    #[error("Twilio error: {0}")]
    TwilioError(#[from] twilio::Error),
    #[error("Not implemented")]
    NotImplemented,
    #[error("Socure error: {0}")]
    SocureError(#[from] socure::Error),
    #[error("Calls to vendor disabled via circuit breaker feature flag")]
    VendorCallsDisabledError,
}
