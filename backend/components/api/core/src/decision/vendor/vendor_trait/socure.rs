use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::socure::client::SocureClient;
use idv::socure::SocureIDPlusAPIResponse;
use idv::socure::SocureIDPlusRequest;
use idv::ParsedResponse;
use newtypes::PiiJsonValue;
use newtypes::VendorAPI;

////////////////////
/// Socure Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse> for SocureClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "SocureIDPlusRequest"))]
    async fn make_request(&self, request: SocureIDPlusRequest) -> FpResult<SocureIDPlusAPIResponse> {
        let raw_response = self
            .idplus(
                // TODO: this should return PiiJsonValue itself
                request.idv_data,
                request.socure_device_session_id,
                request.ip_address,
            )
            .await?;
        let parsed_response = idv::socure::parse_response(raw_response.clone())?;
        Ok(SocureIDPlusAPIResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for SocureIDPlusAPIResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SocureIdPlus
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::SocureIDPlus(self.parsed_response.clone())
    }
}
