// for test fixture vendor responses json
#![recursion_limit = "256"]
use std::fmt::Debug;

use ::twilio::response::lookup::LookupV2Response;
use experian::cross_core::response::CrossCoreAPIResponse;
use idology::{expectid::response::ExpectIDResponse, pa::response::PaResponse};
use incode::{
    curp_validation::response::CurpValidationResponse,
    doc::response::{
        AddConsentResponse, AddCustomerResponse, AddSelfieResponse, AddSideResponse, FetchOCRResponse,
        FetchScoresResponse, GetOnboardingStatusResponse, ProcessFaceResponse, ProcessIdResponse,
    },
    response::OnboardingStartResponse,
    watchlist::response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
    IncodeAPIResult, IncodeClientErrorCustomFailureReasons,
};
use lexis::response::FlexIdResponse;
use middesk::response::{
    business::BusinessResponse,
    webhook::{MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse},
};
use neuro_id::response::NeuroIdAnalyticsResponse;
use newtypes::{PiiJsonValue, VendorAPI};
use socure::response::SocureIDPlusResponse;

pub mod experian;
pub mod fingerprintjs;
pub mod footprint;
pub mod footprint_http_client;
pub mod idology;
pub mod incode;
pub mod lexis;
pub mod middesk;
pub mod neuro_id;
pub mod requirements;
pub mod samba;
pub mod socure;
pub mod stytch;
pub mod test_fixtures;
pub mod tests;
pub mod twilio;
#[allow(clippy::large_enum_variant)]
#[derive(Clone, serde::Serialize)]
#[serde(untagged)]
pub enum ParsedResponse {
    IDologyExpectID(ExpectIDResponse),
    IDologyPa(PaResponse),
    TwilioLookupV2(LookupV2Response),
    SocureIDPlus(SocureIDPlusResponse),
    ExperianPreciseID(CrossCoreAPIResponse),
    MiddeskCreateBusiness(BusinessResponse),
    MiddeskGetBusiness(BusinessResponse),
    MiddeskBusinessUpdateWebhook(MiddeskBusinessUpdateWebhookResponse),
    MiddeskTinRetriedWebhook(MiddeskTinRetriedWebhookResponse),
    IncodeOnboardingStart(OnboardingStartResponse),
    IncodeAddFront(AddSideResponse),
    IncodeAddBack(AddSideResponse),
    IncodeFetchScores(FetchScoresResponse),
    IncodeProcessId(ProcessIdResponse),
    IncodeAddPrivacyConsent(AddConsentResponse),
    IncodeAddMLConsent(AddConsentResponse),
    IncodeFetchOCR(FetchOCRResponse),
    IncodeAddSelfie(AddSelfieResponse),
    IncodeWatchlistCheck(WatchlistResultResponse),
    IncodeUpdatedWatchlistResult(UpdatedWatchlistResultResponse),
    IncodeRawResponse(PiiJsonValue),
    IncodeGetOnboardingStatus(GetOnboardingStatusResponse),
    IncodeProcessFace(ProcessFaceResponse),
    StytchLookup(stytch::response::LookupResponse),
    FootprintDeviceAttestation(footprint::FootprintDeviceAttestationData),
    AwsTextract(PiiJsonValue),
    AwsRekognition(PiiJsonValue),
    LexisFlexId(FlexIdResponse),
    IncodeCurpValidation(CurpValidationResponse),
    IncodeGovernmentValidation(PiiJsonValue),
    NeuroIdAnalytics(NeuroIdAnalyticsResponse),
    IncodeApproveSession(AddCustomerResponse),
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

    pub fn from_middesk_business_update_webhook(
        raw_response: serde_json::Value,
    ) -> Result<Self, crate::Error> {
        let parsed: MiddeskBusinessUpdateWebhookResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::MiddeskBusinessUpdateWebhook(parsed))
    }

    pub fn from_middesk_tin_retried_webhook(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: MiddeskTinRetriedWebhookResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::MiddeskTinRetriedWebhook(parsed))
    }

    pub fn from_middesk_get_business(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: BusinessResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::MiddeskGetBusiness(parsed))
    }

    pub fn from_incode_start_response(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: OnboardingStartResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeOnboardingStart(parsed))
    }

    // We should never need this
    pub fn from_incode_add_front(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: AddSideResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeAddFront(parsed))
    }

    // We should never need this
    pub fn from_incode_add_back(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: AddSideResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeAddBack(parsed))
    }

    // We should never need this
    pub fn from_incode_process_id(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: ProcessIdResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeProcessId(parsed))
    }

    // We should never need this
    pub fn from_incode_fetch_scores(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: FetchScoresResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeFetchScores(parsed))
    }

    // We should never need this
    pub fn from_incode_add_privacy_consent(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: AddConsentResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeAddPrivacyConsent(parsed))
    }

    // We should never need this
    pub fn from_incode_add_ml_consent(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: AddConsentResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeAddMLConsent(parsed))
    }

    // We should never need this
    pub fn from_incode_fetch_ocr(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: FetchOCRResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeFetchOCR(parsed))
    }

    // We should never need this
    pub fn from_incode_add_selfie(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: AddSelfieResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeAddSelfie(parsed))
    }

    pub fn from_incode_watchlist_check(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: WatchlistResultResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeWatchlistCheck(parsed))
    }

    pub fn from_incode_updated_watchlist_result(
        raw_response: serde_json::Value,
    ) -> Result<Self, crate::Error> {
        let parsed: UpdatedWatchlistResultResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeUpdatedWatchlistResult(parsed))
    }

    // We should never need this
    pub fn from_incode_get_onboarding_status(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: GetOnboardingStatusResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeGetOnboardingStatus(parsed))
    }

    // We should never need this
    pub fn from_incode_process_face(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed: ProcessFaceResponse = serde_json::value::from_value(raw_response)?;
        Ok(Self::IncodeProcessFace(parsed))
    }

    pub fn from_stytch(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::stytch::response::parse_response(raw_response).map_err(Error::from)?;
        Ok(Self::StytchLookup(parsed))
    }

    pub fn from_lexis_flex_id(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let parsed = crate::lexis::parse_response(raw_response).map_err(Error::from)?;
        Ok(Self::LexisFlexId(parsed))
    }

    pub fn from_incode_curp_validation(raw_response: serde_json::Value) -> Result<Self, crate::Error> {
        let deser: CurpValidationResponse = Self::from_incode_response(raw_response)?;

        Ok(Self::IncodeCurpValidation(deser))
    }

    fn from_incode_response<T>(raw_response: serde_json::Value) -> Result<T, crate::Error>
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize + serde::de::DeserializeOwned,
    {
        IncodeAPIResult::try_from(raw_response)?
            .into_success()
            .map_err(Error::from)
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
    #[error("Incode error: {0}")]
    IncodeError(#[from] incode::error::Error),
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
    #[error("Assertion error: {0}")]
    AssertionError(String),
    #[error("Stytch error: {0}")]
    StytchError(#[from] stytch::error::Error),
    #[error("Aws Rekognition error: {0}")]
    AwsRekognitionError(#[from] selfie_doc::AwsSelfieDocError),
    #[error("LexisError: {0}")]
    LexisError(#[from] lexis::Error),
    #[error("NeuroIdError: {0}")]
    NeuroIdError(#[from] neuro_id::error::Error),
}

impl From<&ParsedResponse> for VendorAPI {
    fn from(value: &ParsedResponse) -> Self {
        match value {
            ParsedResponse::IDologyExpectID(_) => VendorAPI::IdologyExpectId,
            ParsedResponse::IDologyPa(_) => VendorAPI::IdologyPa,
            ParsedResponse::TwilioLookupV2(_) => VendorAPI::TwilioLookupV2,
            ParsedResponse::SocureIDPlus(_) => VendorAPI::SocureIdPlus,
            ParsedResponse::ExperianPreciseID(_) => VendorAPI::ExperianPreciseId,
            ParsedResponse::MiddeskCreateBusiness(_) => VendorAPI::MiddeskCreateBusiness,
            ParsedResponse::MiddeskGetBusiness(_) => VendorAPI::MiddeskGetBusiness,
            ParsedResponse::MiddeskBusinessUpdateWebhook(_) => VendorAPI::MiddeskBusinessUpdateWebhook,
            ParsedResponse::MiddeskTinRetriedWebhook(_) => VendorAPI::MiddeskTinRetriedWebhook,
            ParsedResponse::IncodeOnboardingStart(_) => VendorAPI::IncodeStartOnboarding,
            ParsedResponse::IncodeAddFront(_) => VendorAPI::IncodeAddFront,
            ParsedResponse::IncodeAddBack(_) => VendorAPI::IncodeAddBack,
            ParsedResponse::IncodeFetchScores(_) => VendorAPI::IncodeFetchScores,
            ParsedResponse::IncodeProcessId(_) => VendorAPI::IncodeProcessId,
            ParsedResponse::IncodeAddPrivacyConsent(_) => VendorAPI::IncodeAddPrivacyConsent,
            ParsedResponse::IncodeAddMLConsent(_) => VendorAPI::IncodeAddMlConsent,
            ParsedResponse::IncodeFetchOCR(_) => VendorAPI::IncodeFetchOcr,
            ParsedResponse::IncodeAddSelfie(_) => VendorAPI::IncodeAddSelfie,
            ParsedResponse::IncodeWatchlistCheck(_) => VendorAPI::IncodeWatchlistCheck,
            ParsedResponse::IncodeUpdatedWatchlistResult(_) => VendorAPI::IncodeUpdatedWatchlistResult,
            ParsedResponse::IncodeRawResponse(_) => VendorAPI::IncodeGetOnboardingStatus, // TODO: i think we decided we'd remove IncodeRawResponse
            ParsedResponse::IncodeGetOnboardingStatus(_) => VendorAPI::IncodeGetOnboardingStatus,
            ParsedResponse::IncodeProcessFace(_) => VendorAPI::IncodeProcessFace,
            ParsedResponse::StytchLookup(_) => VendorAPI::StytchLookup,
            ParsedResponse::FootprintDeviceAttestation(_) => VendorAPI::FootprintDeviceAttestation,
            ParsedResponse::AwsTextract(_) => VendorAPI::AwsTextract,
            ParsedResponse::AwsRekognition(_) => VendorAPI::AwsRekognition,
            ParsedResponse::LexisFlexId(_) => VendorAPI::LexisFlexId,
            ParsedResponse::IncodeCurpValidation(_) => VendorAPI::IncodeCurpValidation,
            ParsedResponse::IncodeGovernmentValidation(_) => VendorAPI::IncodeGovernmentValidation,
            ParsedResponse::NeuroIdAnalytics(_) => VendorAPI::NeuroIdAnalytics,
            ParsedResponse::IncodeApproveSession(_) => VendorAPI::IncodeApproveSession,
        }
    }
}

// Experian and Idology throw a hard error on last names <2 char length. This is a silly hack which will append hyphens to such names so we can at least do a successful
// vendor call to proceed the workflow and also for the chance that an id can be located (even if we get back name does not reason codes)
pub fn elongate_if_single_letter(s: String) -> String {
    if s.is_empty() {
        "--".to_owned()
    } else if s.len() == 1 {
        format!("{}-", s).to_owned()
    } else {
        s
    }
}

#[cfg(test)]
mod lib_tests {
    use super::elongate_if_single_letter;
    use test_case::test_case;

    #[test_case("boberto" => "boberto")]
    #[test_case("bo" => "bo")]
    #[test_case("b" => "b-")]
    #[test_case("" => "--")]
    fn test_elongate_if_single_letter(s: &str) -> String {
        elongate_if_single_letter(s.to_owned())
    }
}
