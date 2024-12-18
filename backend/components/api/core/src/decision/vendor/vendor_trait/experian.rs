use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::ParsedResponse;
use newtypes::VendorAPI;

////////////////////
/// Experian Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<ExperianCrossCoreRequest, ExperianCrossCoreResponse> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "ExperianCrossCoreRequest"))]
    async fn make_request(&self, request: ExperianCrossCoreRequest) -> FpResult<ExperianCrossCoreResponse> {
        let raw_response = idv::experian::cross_core::send_precise_id_request(self, request).await?;
        let response = ExperianCrossCoreResponse::from_response(raw_response);
        Ok(response)
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
        match &self.parsed {
            Ok(res) => ParsedResponse::ExperianPreciseID(res.clone()),
            // TODO: rm or fix
            Err(_) => ParsedResponse::IncodeRawResponse(self.raw_response.clone()),
        }
    }
}
