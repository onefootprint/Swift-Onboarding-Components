use super::{
    VendorAPICall,
    VendorAPIResponse,
};
use async_trait::async_trait;
use idv::middesk::client::MiddeskClient;
use idv::middesk::{
    MiddeskCreateBusinessRequest,
    MiddeskCreateBusinessResponse,
    MiddeskGetBusinessRequest,
    MiddeskGetBusinessResponse,
};
use idv::ParsedResponse;
use newtypes::{
    PiiJsonValue,
    VendorAPI,
};

//////////////////////
/// Middesk impl
/// /////////////////
#[async_trait]
impl VendorAPICall<MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, idv::middesk::Error>
    for MiddeskClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "MiddeskCreateBusinessRequest"))]
    async fn make_request(
        &self,
        request: MiddeskCreateBusinessRequest,
    ) -> Result<MiddeskCreateBusinessResponse, idv::middesk::Error> {
        let raw_response = self.post_business(request).await?;
        let parsed_response = idv::middesk::response::parse_response(raw_response.clone())?;

        Ok(MiddeskCreateBusinessResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for MiddeskCreateBusinessResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::MiddeskCreateBusiness
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::MiddeskCreateBusiness(self.parsed_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<MiddeskGetBusinessRequest, MiddeskGetBusinessResponse, idv::middesk::Error>
    for MiddeskClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "MiddeskGetBusinessRequest"))]
    async fn make_request(
        &self,
        request: MiddeskGetBusinessRequest,
    ) -> Result<MiddeskGetBusinessResponse, idv::middesk::Error> {
        let raw_response = self.get_business(request).await?;
        let parsed_response = idv::middesk::response::parse_response(raw_response.clone())?;

        Ok(MiddeskGetBusinessResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for MiddeskGetBusinessResponse {
    fn vendor_api(&self) -> VendorAPI {
        VendorAPI::MiddeskGetBusiness
    }

    fn raw_response(&self) -> PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::MiddeskGetBusiness(self.parsed_response.clone())
    }
}
