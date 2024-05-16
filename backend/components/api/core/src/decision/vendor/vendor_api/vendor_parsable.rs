use idv::{
    experian::cross_core::response::CrossCoreAPIResponse,
    idology::{expectid::response::ExpectIDResponse, pa::response::PaResponse},
    incode::{
        doc::response::{AddCustomerResponse, FetchOCRResponse, FetchScoresResponse},
        watchlist::response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
    },
    ParsedResponse,
};
use newtypes::VendorAPI;
use serde::de::DeserializeOwned;

use super::vendor_api_struct::{WrappedVendorAPI, *};

pub trait AsParsedResponse {
    fn into_parsed_response(self) -> ParsedResponse;
}

pub trait VendorParsable
where
    Self: Into<WrappedVendorAPI> + Clone,
{
    type ParsedType: DeserializeOwned + AsParsedResponse;

    fn parse(&self, value: serde_json::Value) -> Result<Self::ParsedType, serde_json::Error> {
        let parsed: Self::ParsedType = serde_json::from_value(value)?;

        Ok(parsed)
    }

    fn vendor_api(&self) -> VendorAPI {
        let wrapped: WrappedVendorAPI = self.clone().into();
        VendorAPI::from(wrapped)
    }
}


// Idology KYC
impl VendorParsable for IdologyExpectID {
    type ParsedType = ExpectIDResponse;
}
impl AsParsedResponse for ExpectIDResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyExpectID(self)
    }
}
// Experian KYC
impl VendorParsable for ExperianPreciseID {
    type ParsedType = CrossCoreAPIResponse;
}
impl AsParsedResponse for CrossCoreAPIResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::ExperianPreciseID(self)
    }
}

// Incode Fetch OCR
impl VendorParsable for IncodeFetchOCR {
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
// Idology watchlist
impl VendorParsable for IdologyPa {
    type ParsedType = PaResponse;
}
impl AsParsedResponse for PaResponse {
    fn into_parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyPa(self)
    }
}
