use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::stytch::client::StytchClient;
use idv::stytch::StytchLookupRequest;
use idv::stytch::StytchLookupResponse;
use idv::ParsedResponse;
use newtypes::VendorAPI;

#[async_trait]
impl VendorAPICall<StytchLookupRequest, StytchLookupResponse> for StytchClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "StytchLookupRequest"))]
    async fn make_request(&self, request: StytchLookupRequest) -> FpResult<StytchLookupResponse> {
        let raw_response = self.lookup(&request.telemetry_id).await?;

        let res = StytchLookupResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for StytchLookupResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::StytchLookup
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        match &self.parsed {
            Ok(res) => ParsedResponse::StytchLookup(res.clone()),
            // TODO: rm or fix
            Err(_) => ParsedResponse::IncodeRawResponse(self.raw_response.clone()),
        }
    }
}
