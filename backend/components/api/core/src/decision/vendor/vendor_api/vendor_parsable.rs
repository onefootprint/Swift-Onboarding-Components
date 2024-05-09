use idv::{
    experian::cross_core::response::CrossCoreAPIResponse,
    idology::expectid::response::ExpectIDResponse,
    incode::{
        doc::response::{AddCustomerResponse, FetchOCRResponse, FetchScoresResponse},
        watchlist::response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
    },
};
use newtypes::VendorAPI;
use serde::de::DeserializeOwned;

use super::vendor_api_struct::{WrappedVendorAPI, *};

pub trait VendorParsable
where
    Self: Into<WrappedVendorAPI> + Clone,
{
    type ParsedType: DeserializeOwned;

    fn parse(&self, value: serde_json::Value) -> Result<Self::ParsedType, serde_json::Error> {
        let parsed: Self::ParsedType = serde_json::from_value(value)?;

        Ok(parsed)
    }

    fn vendor_api(&self) -> VendorAPI {
        let wrapped: WrappedVendorAPI = self.clone().into();
        VendorAPI::from(wrapped)
    }
}


// Mapping of a VendorAPI -> the rust struct of the API response
impl VendorParsable for IncodeApproveSession {
    type ParsedType = AddCustomerResponse;
}
impl VendorParsable for IdologyExpectID {
    type ParsedType = ExpectIDResponse;
}
impl VendorParsable for ExperianPreciseID {
    type ParsedType = CrossCoreAPIResponse;
}
impl VendorParsable for IncodeFetchOCR {
    type ParsedType = FetchOCRResponse;
}
impl VendorParsable for IncodeFetchScores {
    type ParsedType = FetchScoresResponse;
}
impl VendorParsable for IncodeWatchlistCheck {
    type ParsedType = WatchlistResultResponse;
}
impl VendorParsable for IncodeUpdatedWatchlistResult {
    type ParsedType = UpdatedWatchlistResultResponse;
}
