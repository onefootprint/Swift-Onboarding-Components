use super::VendorAPICall;
use super::VendorAPIResponse;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::sentilink::application_risk::request::ApplicationRiskRequest;
use idv::sentilink::client::SentilinkClientAdapter;
use idv::sentilink::SentilinkAPIResponse;
use idv::sentilink::SentilinkApplicationRiskRequest;
use idv::ParsedResponse;
use newtypes::VendorAPI;

#[async_trait]
impl VendorAPICall<SentilinkApplicationRiskRequest, SentilinkAPIResponse, idv::sentilink::error::Error>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "SentilinkAPIRequest<ApplicationRisk>")
    )]
    async fn make_request(
        &self,
        request: SentilinkApplicationRiskRequest,
    ) -> Result<SentilinkAPIResponse, idv::sentilink::error::Error> {
        let client_adapter = SentilinkClientAdapter::new(request.credentials.clone());
        let request = ApplicationRiskRequest::try_from(request)?;

        let raw_response = client_adapter
            .send_application_risk_request(self, request)
            .await?;
        let res = SentilinkAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for SentilinkAPIResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SentilinkApplicationRisk
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm or fix
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}
