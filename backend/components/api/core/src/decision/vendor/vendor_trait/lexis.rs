use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::lexis::client::LexisFlexIdRequest;
use idv::lexis::client::LexisFlexIdResponse;
use idv::ParsedResponse;
use newtypes::PiiJsonValue;
use newtypes::VendorAPI;

#[async_trait]
impl VendorAPICall<LexisFlexIdRequest, LexisFlexIdResponse> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "LexisFlexIdRequest"))]
    async fn make_request(&self, request: LexisFlexIdRequest) -> FpResult<LexisFlexIdResponse> {
        let raw_response = idv::lexis::client::flex_id(self, request).await?;
        let parsed_response = idv::lexis::parse_response(raw_response.clone())
            .map_err(|e| e.into_error_with_response(raw_response.clone()))?;

        parsed_response
            .validate()
            .map_err(|e| e.into_error_with_response(raw_response.clone()))?;

        Ok(LexisFlexIdResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for LexisFlexIdResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::LexisFlexId
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::LexisFlexId(self.parsed_response.clone())
    }
}
