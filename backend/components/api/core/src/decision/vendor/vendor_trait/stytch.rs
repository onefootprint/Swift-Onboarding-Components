use super::{
    VendorAPICall,
    VendorAPIResponse,
};
use async_trait::async_trait;
use idv::stytch::client::StytchClient;
use idv::stytch::{
    StytchLookupRequest,
    StytchLookupResponse,
};
use idv::ParsedResponse;
use newtypes::{
    PiiJsonValue,
    VendorAPI,
};

#[async_trait]
impl VendorAPICall<StytchLookupRequest, StytchLookupResponse, idv::stytch::error::Error> for StytchClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "StytchLookupRequest"))]
    async fn make_request(
        &self,
        request: StytchLookupRequest,
    ) -> Result<StytchLookupResponse, idv::stytch::error::Error> {
        let raw_response = self.lookup(&request.telemetry_id).await?;
        let parsed_response = idv::stytch::response::parse_response(raw_response.clone())
            .map_err(|e| e.into_error_with_response(raw_response.clone()))?;
        Ok(StytchLookupResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
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
        ParsedResponse::StytchLookup(self.parsed_response.clone())
    }
}
