use idv::experian::cross_core::response::CrossCoreAPIResponse;
use idv::footprint::FootprintDeviceAttestationData;
use idv::idology::expectid::response::ExpectIDResponse;
use idv::idology::pa::response::PaResponse;
use idv::incode::curp_validation::response::CurpValidationResponse;
use idv::incode::doc::response::AddCustomerResponse;
use idv::incode::doc::response::AddSelfieResponse;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::watchlist::response::UpdatedWatchlistResultResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::lexis::response::FlexIdResponse;
use idv::middesk::response::business::BusinessResponse;
use idv::middesk::response::webhook::MiddeskBusinessUpdateWebhookResponse;
use idv::neuro_id::response::NeuroIdAnalyticsResponse;
use idv::samba::response::CreateOrderResponse;
use idv::sentilink::application_risk::response::ApplicationRiskResponse;
use idv::ParsedResponse;
use newtypes::vendor_api_struct::*;
use newtypes::VendorAPIMarker;
use serde::de::DeserializeOwned;
use twilio::response::lookup::LookupV2Response;

pub trait AsParsedResponse {
    fn into_parsed_response(self) -> ParsedResponse;
}

pub trait VendorParsable
where
    Self: VendorAPIMarker + Clone,
{
    type ParsedType: DeserializeOwned;

    fn parse(&self, value: serde_json::Value) -> Result<Self::ParsedType, serde_json::Error> {
        let parsed: Self::ParsedType = serde_json::from_value(value)?;

        Ok(parsed)
    }
}

// Idology KYC
impl VendorParsable for IdologyExpectId {
    type ParsedType = ExpectIDResponse;
}
impl AsParsedResponse for ExpectIDResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyExpectID(self)
    }
}
// Experian KYC
impl VendorParsable for ExperianPreciseId {
    type ParsedType = CrossCoreAPIResponse;
}
impl AsParsedResponse for CrossCoreAPIResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::ExperianPreciseID(self)
    }
}

// Incode Fetch OCR
impl VendorParsable for IncodeFetchOcr {
    type ParsedType = FetchOCRResponse;
}
impl AsParsedResponse for FetchOCRResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeFetchOCR(self)
    }
}

// Incode scores
impl VendorParsable for IncodeFetchScores {
    type ParsedType = FetchScoresResponse;
}
impl AsParsedResponse for FetchScoresResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeFetchScores(self)
    }
}
// Incode watchlist
impl VendorParsable for IncodeWatchlistCheck {
    type ParsedType = WatchlistResultResponse;
}
impl AsParsedResponse for WatchlistResultResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeWatchlistCheck(self)
    }
}
// Incode updated watchlist
impl VendorParsable for IncodeUpdatedWatchlistResult {
    type ParsedType = UpdatedWatchlistResultResponse;
}
impl AsParsedResponse for UpdatedWatchlistResultResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeUpdatedWatchlistResult(self)
    }
}
// Incode approve session (selfie dupes)
impl VendorParsable for IncodeApproveSession {
    type ParsedType = AddCustomerResponse;
}
impl AsParsedResponse for AddCustomerResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeApproveSession(self)
    }
}

// Incode Selfie
impl VendorParsable for IncodeAddSelfie {
    type ParsedType = AddSelfieResponse;
}
// Idology watchlist
impl VendorParsable for IdologyPa {
    type ParsedType = PaResponse;
}
impl AsParsedResponse for PaResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyPa(self)
    }
}

// lexis
impl VendorParsable for LexisFlexId {
    type ParsedType = FlexIdResponse;
}
impl AsParsedResponse for FlexIdResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::LexisFlexId(self)
    }
}

// Middesk
impl VendorParsable for MiddeskGetBusiness {
    type ParsedType = BusinessResponse;
}
impl AsParsedResponse for BusinessResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::MiddeskGetBusiness(self)
    }
}
impl VendorParsable for MiddeskBusinessUpdateWebhook {
    type ParsedType = MiddeskBusinessUpdateWebhookResponse;
}
impl AsParsedResponse for MiddeskBusinessUpdateWebhookResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::MiddeskBusinessUpdateWebhook(self)
    }
}

// Samba
// we don't need a vendor result for this one
impl VendorParsable for SambaLicenseValidationCreate {
    type ParsedType = CreateOrderResponse;
}

impl VendorParsable for SambaActivityHistoryCreate {
    type ParsedType = CreateOrderResponse;
}

// Neuro
impl VendorParsable for NeuroIdAnalytics {
    type ParsedType = NeuroIdAnalyticsResponse;
}
impl AsParsedResponse for NeuroIdAnalyticsResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::NeuroIdAnalytics(self)
    }
}

// Incode Curp
impl VendorParsable for IncodeCurpValidation {
    type ParsedType = CurpValidationResponse;
}
impl AsParsedResponse for CurpValidationResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeCurpValidation(self)
    }
}

// FootprintDeviceAttestationData
impl VendorParsable for FootprintDeviceAttestation {
    type ParsedType = FootprintDeviceAttestationData;
}

// Twilio
impl VendorParsable for TwilioLookupV2 {
    type ParsedType = LookupV2Response;
}

// Sentilink
impl VendorParsable for SentilinkApplicationRisk {
    type ParsedType = ApplicationRiskResponse;
}
