use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::samba::client::SambaSafetyClientAdapter;
use idv::samba::common::SambaCheckOrderStatusRequest;
use idv::samba::common::SambaGetReportRequest;
use idv::samba::common::SambaOrderRequest;
use idv::samba::response::activity_history::GetAHOrderResponse;
use idv::samba::response::license_validation::GetLVOrderResponse;
use idv::samba::response::CreateOrderResponse;
use idv::samba::response::OrderStatusResponse;
use idv::samba::SambaAPIResponse;
use idv::ParsedResponse;
use newtypes::SambaActivityHistoryCreate;
use newtypes::SambaActivityHistoryGetReport;
use newtypes::SambaLicenseValidationCreate;
use newtypes::SambaLicenseValidationGetReport;
use newtypes::VendorAPI;

/// Create License Validation Samba Order
#[async_trait]
impl VendorAPICall<SambaOrderRequest<SambaLicenseValidationCreate>, SambaAPIResponse<CreateOrderResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "SambaOrderRequest<LicenseValidation>")
    )]
    async fn make_request(
        &self,
        request: SambaOrderRequest<SambaLicenseValidationCreate>,
    ) -> FpResult<SambaAPIResponse<CreateOrderResponse>> {
        let client_adapter = SambaSafetyClientAdapter::new(request.credentials.clone())?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client
            .create_license_validation_order(self, request.data)
            .await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for SambaAPIResponse<CreateOrderResponse> {
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
impl VendorAPICall<SambaCheckOrderStatusRequest, SambaAPIResponse<OrderStatusResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "SambaCheckLVOrderStatusRequest"))]
    async fn make_request(
        &self,
        request: SambaCheckOrderStatusRequest,
    ) -> FpResult<SambaAPIResponse<OrderStatusResponse>> {
        let SambaCheckOrderStatusRequest {
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
impl VendorAPIResponse for SambaAPIResponse<OrderStatusResponse> {
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
impl
    VendorAPICall<
        SambaGetReportRequest<SambaLicenseValidationGetReport>,
        SambaAPIResponse<GetLVOrderResponse>,
    > for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "SambaGetLVReportRequest"))]
    async fn make_request(
        &self,
        request: SambaGetReportRequest<SambaLicenseValidationGetReport>,
    ) -> FpResult<SambaAPIResponse<GetLVOrderResponse>> {
        let SambaGetReportRequest {
            credentials,
            report_id,
            _phantom,
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


#[async_trait]
impl VendorAPICall<SambaOrderRequest<SambaActivityHistoryCreate>, SambaAPIResponse<CreateOrderResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "SambaOrderRequest<SambaActivityHistoryCreate>")
    )]
    async fn make_request(
        &self,
        request: SambaOrderRequest<SambaActivityHistoryCreate>,
    ) -> FpResult<SambaAPIResponse<CreateOrderResponse>> {
        let client_adapter = SambaSafetyClientAdapter::new(request.credentials.clone())?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client
            .create_activity_history_order(self, request.data)
            .await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}


#[async_trait]
impl VendorAPICall<SambaGetReportRequest<SambaActivityHistoryGetReport>, SambaAPIResponse<GetAHOrderResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "SambaGetReportRequest<SambaActivityHistoryGetReport>")
    )]
    async fn make_request(
        &self,
        request: SambaGetReportRequest<SambaActivityHistoryGetReport>,
    ) -> FpResult<SambaAPIResponse<GetAHOrderResponse>> {
        let SambaGetReportRequest {
            credentials,
            report_id,
            _phantom,
        } = request;
        let client_adapter = SambaSafetyClientAdapter::new(credentials)?;
        let authed_client = client_adapter.get_authenticated_client(self).await?;
        let raw_response = authed_client.get_activity_history_report(self, report_id).await?;
        let res = SambaAPIResponse::from_response(raw_response).await;
        Ok(res)
    }
}

impl VendorAPIResponse for SambaAPIResponse<GetAHOrderResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::SambaActivityHistoryGetReport
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm or fix
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}
