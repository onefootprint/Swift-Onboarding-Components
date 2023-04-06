// for test fixture vendor responses json
#![recursion_limit = "256"]

use std::fmt::Debug;

use ::twilio::response::lookup::LookupV2Response;
use experian::cross_core::response::CrossCoreAPIResponse;
use idology::pa::response::PaResponse;
use middesk::response::business::BusinessResponse;

use idology::expectid::response::ExpectIDResponse;
use idology::scan_onboarding::response::ScanOnboardingAPIResponse;
use idology::scan_verify::response::{ScanVerifyAPIResponse, ScanVerifySubmissionAPIResponse};

use newtypes::PiiJsonValue;

use socure::response::SocureIDPlusResponse;

pub mod experian;
pub mod fingerprintjs;
pub mod footprint_http_client;
pub mod idology;
pub mod incode;
pub mod lexis;
pub mod middesk;
pub mod requirements;
pub mod socure;
pub mod test_fixtures;
pub mod tests;
pub mod twilio;

#[allow(clippy::large_enum_variant)]
#[derive(Clone, serde::Serialize)]
#[serde(untagged)]
pub enum ParsedResponse {
    IDologyExpectID(ExpectIDResponse),
    IDologyScanVerifyResult(ScanVerifyAPIResponse),
    IDologyScanVerifySubmission(ScanVerifySubmissionAPIResponse),
    IDologyScanOnboarding(ScanOnboardingAPIResponse),
    IDologyPa(PaResponse),
    TwilioLookupV2(LookupV2Response),
    SocureIDPlus(SocureIDPlusResponse),
    ExperianPreciseID(CrossCoreAPIResponse),
    MiddeskCreateBusiness(BusinessResponse),
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

    pub fn from_idology_pa(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::idology::pa::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::IDologyPa(parsed))
    }

    pub fn from_experian_cross_core(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed =
            crate::experian::cross_core::response::parse_response(raw_response).map_err(Error::from)?;

        Ok(Self::ExperianPreciseID(parsed))
    }

    pub fn from_middesk_create_business(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::middesk::response::parse_response(raw_response)?;
        Ok(Self::MiddeskCreateBusiness(parsed))
    }
}

#[derive(Clone)]
pub struct VendorResponse {
    // TODO: make a trait and remove the ParsedResponse enum
    pub response: ParsedResponse,
    pub raw_response: PiiJsonValue,
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
    #[error("serde_json error: {0}")]
    SerderJsonError(#[from] serde_json::Error),
    #[error("Experian error: {0}")]
    ExperianError(#[from] experian::error::Error),
    #[error("{0}")]
    ConversionError(String),
    #[error("Middesk error: {0}")]
    MiddeskError(#[from] middesk::Error),
}
