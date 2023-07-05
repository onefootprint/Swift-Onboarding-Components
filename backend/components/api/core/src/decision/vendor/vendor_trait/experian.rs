use async_trait::async_trait;
use idv::{
    experian::{self, ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    footprint_http_client::FootprintVendorHttpClient,
    ParsedResponse,
};
use newtypes::{PiiJsonValue, VendorAPI};

use super::{VendorAPICall, VendorAPIResponse};
////////////////////
/// Experian Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<ExperianCrossCoreRequest, ExperianCrossCoreResponse, idv::experian::error::Error>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: ExperianCrossCoreRequest,
    ) -> Result<ExperianCrossCoreResponse, idv::experian::error::Error> {
        let raw_response = idv::experian::cross_core::send_precise_id_request(self, request).await?;
        let parsed_response = experian::cross_core::response::parse_response(raw_response.clone())?;

        parsed_response
            .validate()
            .map_err(|e| e.into_parsable_error(raw_response.clone()))?;

        Ok(ExperianCrossCoreResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for ExperianCrossCoreResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::ExperianPreciseID
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::ExperianPreciseID(self.parsed_response)
    }
}
