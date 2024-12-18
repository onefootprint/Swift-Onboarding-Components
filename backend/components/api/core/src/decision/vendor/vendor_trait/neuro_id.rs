use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::neuro_id::client::NeuroIdClient;
use idv::neuro_id::response::NeuroApiResponse;
use idv::neuro_id::NeuroIdAnalyticsRequest;
use idv::ParsedResponse;
use newtypes::VendorAPI;

#[async_trait]
impl VendorAPICall<NeuroIdAnalyticsRequest, NeuroApiResponse> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "NeuroIdAnalyticsRequest"))]
    async fn make_request(&self, request: NeuroIdAnalyticsRequest) -> FpResult<NeuroApiResponse> {
        let NeuroIdAnalyticsRequest { credentials, id } = request;
        let neuro_client = NeuroIdClient::new(credentials)?;
        let response = neuro_client.get_profile(self, &id).await?;

        Ok(NeuroApiResponse::from_response(response).await)
    }
}

impl VendorAPIResponse for NeuroApiResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::NeuroIdAnalytics
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        // this is wrong but we don't need this here
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}
