use super::VendorAPICall;
use super::VendorAPIResponse;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::samba::client::SambaSafetyClientAdapter;
use idv::samba::request::SambaCheckLVOrderStatusRequest;
use idv::samba::request::SambaCreateLVOrderRequest;
use idv::samba::request::SambaGetLVReportRequest;
use idv::samba::response::license_validation::CheckLVOrderStatus;
use idv::samba::response::license_validation::CreateLVOrderResponse;
use idv::samba::response::license_validation::GetLVOrderResponse;
use idv::samba::SambaAPIResponse;
use idv::ParsedResponse;
use newtypes::VendorAPI;

/// Create License Validation Samba Order
#[async_trait]
impl
    VendorAPICall<
        SambaCreateLVOrderRequest,
        SambaAPIResponse<CreateLVOrderResponse>,
        idv::samba::error::Error,
    > for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "SambaCreateLVOrderRequest"))]
    async fn make_request(
        &self,
        request: SambaCreateLVOrderRequest,
    ) -> Result<SambaAPIResponse<CreateLVOrderResponse>, idv::samba::error::Error> {
        let client_adapter = SambaSafetyClientAdapter::new(request.credentials.clone())?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client
            .create_license_validation_order(self, request)
            .await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for SambaAPIResponse<CreateLVOrderResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SambaLicenseValidationCreate
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm or fix
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

/// Poll License Validation Samba Order
#[async_trait]
impl
    VendorAPICall<
        SambaCheckLVOrderStatusRequest,
        SambaAPIResponse<CheckLVOrderStatus>,
        idv::samba::error::Error,
    > for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "SambaCheckLVOrderStatusRequest"))]
    async fn make_request(
        &self,
        request: SambaCheckLVOrderStatusRequest,
    ) -> Result<SambaAPIResponse<CheckLVOrderStatus>, idv::samba::error::Error> {
        let SambaCheckLVOrderStatusRequest {
            credentials,
            order_id,
        } = request;
        let client_adapter = SambaSafetyClientAdapter::new(credentials)?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client
            .get_license_validation_status(self, order_id)
            .await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

/// Get License Validation Samba Report
impl VendorAPIResponse for SambaAPIResponse<CheckLVOrderStatus> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SambaLicenseValidationGetStatus
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm or fix
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<SambaGetLVReportRequest, SambaAPIResponse<GetLVOrderResponse>, idv::samba::error::Error>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "SambaGetLVReportRequest"))]
    async fn make_request(
        &self,
        request: SambaGetLVReportRequest,
    ) -> Result<SambaAPIResponse<GetLVOrderResponse>, idv::samba::error::Error> {
        let SambaGetLVReportRequest {
            credentials,
            report_id,
        } = request;
        let client_adapter = SambaSafetyClientAdapter::new(credentials)?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client
            .get_license_validation_report(self, report_id)
            .await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for SambaAPIResponse<GetLVOrderResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SambaLicenseValidationGetReport
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm or fix
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}
