use super::VendorAPICall;
use super::VendorAPIResponse;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::idology::pa::IdologyPaAPIResponse;
use idv::idology::pa::IdologyPaRequest;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::ParsedResponse;
use newtypes::VendorAPI;

/////////////////////
/// Idology Impl - ExpectID
/// ////////////////
#[async_trait]
impl VendorAPICall<IdologyExpectIDRequest, IdologyExpectIDAPIResponse, idv::idology::error::Error>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IdologyExpectIDRequest"))]
    async fn make_request(
        &self,
        request: IdologyExpectIDRequest,
    ) -> Result<IdologyExpectIDAPIResponse, idv::idology::error::Error> {
        let raw_response = idv::idology::verify_expectid(self, request).await?;
        let response = IdologyExpectIDAPIResponse::from_response(raw_response);
        Ok(response)
    }
}

impl VendorAPIResponse for IdologyExpectIDAPIResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IdologyExpectId
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        match &self.parsed {
            Ok(res) => ParsedResponse::IDologyExpectID(res.clone()),
            // TODO: rm or fix
            Err(_) => ParsedResponse::IncodeRawResponse(self.raw_response.clone()),
        }
    }
}

/////////////////////
/// Idology Impl - PA
/// ////////////////
#[async_trait]
impl VendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IdologyPaRequest"))]
    async fn make_request(
        &self,
        request: IdologyPaRequest,
    ) -> Result<IdologyPaAPIResponse, idv::idology::error::Error> {
        let raw_response = idv::idology::standalone_pa(self, request).await?;
        Ok(IdologyPaAPIResponse::from_response(raw_response))
    }
}

impl VendorAPIResponse for IdologyPaAPIResponse {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IdologyPa
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    fn parsed_response(&self) -> ParsedResponse {
        match &self.parsed {
            Ok(res) => ParsedResponse::IDologyPa(res.clone()),
            // TODO: rm or fix
            Err(_) => ParsedResponse::IncodeRawResponse(self.raw_response.clone()),
        }
    }
}
