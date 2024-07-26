use super::VendorAPICall;
use super::VendorAPIResponse;
use async_trait::async_trait;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use idv::ParsedResponse;
use newtypes::PiiJsonValue;
use newtypes::VendorAPI;

////////////////////
/// Twilio Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error> for twilio::Client {
    #[tracing::instrument("make_request", skip_all, fields(request = "TwilioLookupV2Request"))]
    async fn make_request(
        &self,
        request: TwilioLookupV2Request,
    ) -> Result<TwilioLookupV2APIResponse, idv::twilio::Error> {
        let TwilioLookupV2Request {
            idv_data,
            lookup_fields,
        } = request;
        let phone_number = idv_data
            .phone_number
            .ok_or(idv::twilio::Error::PhoneNumberNotPopulated)?;
        let raw_response = self.lookup_v2(phone_number.leak(), lookup_fields).await?;
        let parsed_response = twilio::response::parse_response(raw_response.clone())?;

        Ok(TwilioLookupV2APIResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for TwilioLookupV2APIResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::TwilioLookupV2
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::TwilioLookupV2(self.parsed_response.clone())
    }
}
