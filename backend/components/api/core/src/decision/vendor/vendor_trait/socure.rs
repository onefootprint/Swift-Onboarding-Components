use async_trait::async_trait;
use idv::{
    socure::{client::SocureClient, SocureIDPlusAPIResponse, SocureIDPlusRequest},
    ParsedResponse,
};
use newtypes::{PiiJsonValue, VendorAPI};

use super::{VendorAPICall, VendorAPIResponse};

////////////////////
/// Socure Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error> for SocureClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "SocureIDPlusRequest"))]
    async fn make_request(
        &self,
        request: SocureIDPlusRequest,
    ) -> Result<SocureIDPlusAPIResponse, idv::socure::Error> {
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
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::SocureIDPlus
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::SocureIDPlus(self.parsed_response)
    }
}
