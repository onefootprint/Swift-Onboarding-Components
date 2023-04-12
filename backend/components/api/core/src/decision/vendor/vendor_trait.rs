use async_trait::async_trait;
use idv::{
    experian::{self, ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    footprint_http_client::FootprintVendorHttpClient,
    idology::{
        pa::{IdologyPaAPIResponse, IdologyPaRequest},
        IdologyExpectIDAPIResponse, IdologyExpectIDRequest,
    },
    middesk::{client::MiddeskClient, MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse},
    socure::{client::SocureClient, SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
    ParsedResponse,
};
#[cfg(test)]
use mockall::automock;
use newtypes::{PiiJsonValue, VendorAPI};

pub trait VendorAPIResponse {
    fn vendor_api(self) -> VendorAPI;
    fn raw_response(self) -> PiiJsonValue;
    fn parsed_response(self) -> ParsedResponse;
    // TODO: to_structured_pg_table or whatnot
}

// RequestData
#[cfg_attr(test, automock)]
#[async_trait]
pub trait VendorAPICall<T, U, E>
where
    T: Send + Sync + Sized,
    U: VendorAPIResponse + Sync,
    E: Sync,
{
    async fn make_request(&self, request_data: T) -> Result<U, E>;
}

/////////////////////
/// Idology Impl - ExpectID
/// ////////////////
#[async_trait]
impl VendorAPICall<IdologyExpectIDRequest, IdologyExpectIDAPIResponse, idv::idology::error::Error>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IdologyExpectIDRequest,
    ) -> Result<IdologyExpectIDAPIResponse, idv::idology::error::Error> {
        let raw_response = idv::idology::verify_expectid(self, request).await?; // TODO: this should return PiiJsonValue itself
        let parsed_response = idv::idology::expectid::response::parse_response(raw_response.clone())?;

        parsed_response.response.validate()?;

        Ok(IdologyExpectIDAPIResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for IdologyExpectIDAPIResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::IdologyExpectID
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyExpectID(self.parsed_response)
    }
}

/////////////////////
/// Idology Impl - PA
/// ////////////////
#[async_trait]
impl VendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IdologyPaRequest,
    ) -> Result<IdologyPaAPIResponse, idv::idology::error::Error> {
        let raw_response = idv::idology::standalone_pa(self, request).await?; // TODO: this should return PiiJsonValue itself
        let parsed_response = idv::idology::pa::response::parse_response(raw_response.clone())?;

        parsed_response.response.validate()?;

        Ok(IdologyPaAPIResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for IdologyPaAPIResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::IdologyPa
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IDologyPa(self.parsed_response)
    }
}

////////////////////
/// Socure Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error> for SocureClient {
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
////////////////////
/// Twilio Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error> for twilio::Client {
    async fn make_request(
        &self,
        request: TwilioLookupV2Request,
    ) -> Result<TwilioLookupV2APIResponse, idv::twilio::Error> {
        let phone_number = if let Some(ref phone_number) = request.idv_data.phone_number {
            phone_number
        } else {
            return Err(idv::twilio::Error::PhoneNumberNotPopulated);
        };
        let raw_response = self.lookup_v2(phone_number.leak()).await?;
        let parsed_response = twilio::response::parse_response(raw_response.clone())?;

        Ok(TwilioLookupV2APIResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for TwilioLookupV2APIResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::TwilioLookupV2
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::TwilioLookupV2(self.parsed_response)
    }
}

////////////////////
/// Experian Impl
/// /// ////////////////
#[async_trait]
impl VendorAPICall<ExperianCrossCoreRequest, ExperianCrossCoreResponse, idv::experian::error::Error>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: ExperianCrossCoreRequest,
    ) -> Result<ExperianCrossCoreResponse, idv::experian::error::Error> {
        let raw_response = idv::experian::cross_core::send_precise_id_request(self, request).await?;
        let parsed_response = experian::cross_core::response::parse_response(raw_response.clone())?;

        Ok(ExperianCrossCoreResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for ExperianCrossCoreResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::ExperianPreciseID
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::ExperianPreciseID(self.parsed_response)
    }
}

//////////////////////
/// Middesk impl
/// /////////////////
#[async_trait]
impl VendorAPICall<MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, idv::middesk::Error>
    for MiddeskClient
{
    async fn make_request(
        &self,
        request: MiddeskCreateBusinessRequest,
    ) -> Result<MiddeskCreateBusinessResponse, idv::middesk::Error> {
        let raw_response = self.post_business(request.business_data).await?;
        let parsed_response = idv::middesk::response::parse_response(raw_response.clone())?;

        Ok(MiddeskCreateBusinessResponse {
            raw_response: PiiJsonValue::new(raw_response),
            parsed_response,
        })
    }
}

impl VendorAPIResponse for MiddeskCreateBusinessResponse {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::MiddeskCreateBusiness
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response
    }

    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::MiddeskCreateBusiness(self.parsed_response)
    }
}
