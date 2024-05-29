use super::{
    VendorAPICall,
    VendorAPIResponse,
};
use async_trait::async_trait;
use idv::experian::{
    self,
    ExperianCrossCoreRequest,
    ExperianCrossCoreResponse,
};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::ParsedResponse;
use newtypes::{
    PiiJsonValue,
    VendorAPI,
};
////////////////////
/// Experian Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<ExperianCrossCoreRequest, ExperianCrossCoreResponse, idv::experian::error::Error>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "ExperianCrossCoreRequest"))]
    async fn make_request(
        &self,
        request: ExperianCrossCoreRequest,
    ) -> Result<ExperianCrossCoreResponse, idv::experian::error::Error> {
        let raw_response = idv::experian::cross_core::send_precise_id_request(self, request).await?;
        // catch errors that cannot be deserialized
        let parsed_response = experian::cross_core::response::parse_response(raw_response.clone())
            .map_err(|e| e.into_error_with_response(raw_response.clone()))?;

        // catch errors that come from deserialized response validations
        parsed_response
            .validate()
            .map_err(|e| e.into_error_with_response(raw_response.clone()))?;

        Ok(ExperianCrossCoreResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for ExperianCrossCoreResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::ExperianPreciseId
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::ExperianPreciseID(self.parsed_response.clone())
    }
}
