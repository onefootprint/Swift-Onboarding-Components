use super::VendorAPICall;
use super::VendorAPIResponse;
use api_errors::FpResult;
use async_trait::async_trait;
use chrono::Datelike;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::client::AuthenticatedIncodeClientAdapter;
use idv::incode::client::IncodeClientAdapter;
use idv::incode::curp_validation::response::CurpValidationResponse;
use idv::incode::curp_validation::IncodeCurpValidationRequest;
use idv::incode::doc::request::DocumentSide;
use idv::incode::doc::response::AddConsentResponse;
use idv::incode::doc::response::AddSelfieResponse;
use idv::incode::doc::response::AddSideResponse;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::doc::response::GetOnboardingStatusResponse;
use idv::incode::doc::response::ProcessFaceResponse;
use idv::incode::doc::response::ProcessIdResponse;
use idv::incode::doc::IncodeAddBackRequest;
use idv::incode::doc::IncodeAddFrontRequest;
use idv::incode::doc::IncodeAddMLConsentRequest;
use idv::incode::doc::IncodeAddPrivacyConsentRequest;
use idv::incode::doc::IncodeAddSelfieRequest;
use idv::incode::doc::IncodeFetchOCRRequest;
use idv::incode::doc::IncodeFetchScoresRequest;
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use idv::incode::doc::IncodeProcessFaceRequest;
use idv::incode::doc::IncodeProcessIdRequest;
use idv::incode::government_validation::request::IncodeGovernmentValidationRequest;
use idv::incode::government_validation::response::GovernmentValidationResponse;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::UpdatedWatchlistResultResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::watchlist::IncodeUpdatedWatchlistResultRequest;
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::ParsedResponse;
use newtypes::PiiString;
use newtypes::VendorAPI;

//////////////////////
/// Incode impl
/// /////////////////
#[async_trait]
impl VendorAPICall<IncodeStartOnboardingRequest, IncodeResponse<OnboardingStartResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeStartOnboardingRequest"))]
    async fn make_request(
        &self,
        request: IncodeStartOnboardingRequest,
    ) -> FpResult<IncodeResponse<OnboardingStartResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials)?;
        let raw_response = client
            .onboarding_start(
                self,
                Some(request.configuration_id),
                request.session_id,
                request.custom_name_fields,
            )
            .await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<OnboardingStartResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeStartOnboarding
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddFrontRequest, IncodeResponse<AddSideResponse>> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeAddFrontRequest"))]
    async fn make_request(
        &self,
        request: IncodeAddFrontRequest,
    ) -> FpResult<IncodeResponse<AddSideResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_document(self, request.docv_data, DocumentSide::Front)
            .await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<AddSideResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        // this isn't correct, so don't use it :)
        // 2 VendorAPIs use the same result struct
        unimplemented!()
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddBackRequest, IncodeResponse<AddSideResponse>> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeAddBackRequest"))]
    async fn make_request(&self, request: IncodeAddBackRequest) -> FpResult<IncodeResponse<AddSideResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_document(self, request.docv_data, DocumentSide::Back)
            .await?;
        let result = IncodeResponse::from_response(raw_response).await;
        Ok(result)
    }
}

#[async_trait]
impl VendorAPICall<IncodeProcessIdRequest, IncodeResponse<ProcessIdResponse>> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeProcessIdRequest"))]
    async fn make_request(
        &self,
        request: IncodeProcessIdRequest,
    ) -> FpResult<IncodeResponse<ProcessIdResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.process_id(self).await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<ProcessIdResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeProcessId
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeFetchScoresRequest, IncodeResponse<FetchScoresResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeFetchScoresRequest"))]
    async fn make_request(
        &self,
        request: IncodeFetchScoresRequest,
    ) -> FpResult<IncodeResponse<FetchScoresResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.fetch_scores(self).await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<FetchScoresResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeFetchScores
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

//
// Consent
//
#[async_trait]
impl VendorAPICall<IncodeAddPrivacyConsentRequest, IncodeResponse<AddConsentResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeAddPrivacyConsentRequest"))]
    async fn make_request(
        &self,
        request: IncodeAddPrivacyConsentRequest,
    ) -> FpResult<IncodeResponse<AddConsentResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_privacy_consent(self, request.title, request.content)
            .await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddMLConsentRequest, IncodeResponse<AddConsentResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeAddMLConsentRequest"))]
    async fn make_request(
        &self,
        request: IncodeAddMLConsentRequest,
    ) -> FpResult<IncodeResponse<AddConsentResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.add_ml_consent(self, request.status).await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<AddConsentResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeAddPrivacyConsent
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeFetchOCRRequest, IncodeResponse<FetchOCRResponse>> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeFetchOCRRequest"))]
    async fn make_request(
        &self,
        request: IncodeFetchOCRRequest,
    ) -> FpResult<IncodeResponse<FetchOCRResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.fetch_ocr(self).await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<FetchOCRResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeFetchOcr
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddSelfieRequest, IncodeResponse<AddSelfieResponse>> for FootprintVendorHttpClient {
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeAddSelfieRequest"))]
    async fn make_request(
        &self,
        request: IncodeAddSelfieRequest,
    ) -> FpResult<IncodeResponse<AddSelfieResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.add_selfie(self, request.docv_data).await?;
        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<AddSelfieResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeAddSelfie
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeProcessFaceRequest, IncodeResponse<ProcessFaceResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeProcessFaceRequest"))]
    async fn make_request(
        &self,
        request: IncodeProcessFaceRequest,
    ) -> FpResult<IncodeResponse<ProcessFaceResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.process_face(self).await?;
        let result = IncodeResponse::from_response(raw_response).await;
        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<ProcessFaceResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeProcessFace
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeGetOnboardingStatusRequest, IncodeResponse<GetOnboardingStatusResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "IncodeGetOnboardingStatusRequest")
    )]
    async fn make_request(
        &self,
        request: IncodeGetOnboardingStatusRequest,
    ) -> FpResult<IncodeResponse<GetOnboardingStatusResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .poll_get_onboarding_status(
                self,
                request.session_kind,
                request.incode_verification_session_id,
                request.skip_wait_for_selfie,
            )
            .await?;

        let result = IncodeResponse::from_value(raw_response);

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<GetOnboardingStatusResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeGetOnboardingStatus
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

//////////////////////
/// Watchlist
/// /////////////////

#[async_trait]
impl VendorAPICall<IncodeWatchlistCheckRequest, IncodeResponse<WatchlistResultResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeWatchlistCheckRequest"))]
    async fn make_request(
        &self,
        request: IncodeWatchlistCheckRequest,
    ) -> FpResult<IncodeResponse<WatchlistResultResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let dob_year = request
            .idv_data
            .dob()?
            .map(|d| PiiString::new(d.year().to_string()));

        let raw_response = authenticated_client
            .watchlist_result(
                self,
                request.idv_data.first_name,
                request.idv_data.middle_name,
                request.idv_data.last_name,
                dob_year,
                request.match_kind,
            )
            .await?;

        let result = IncodeResponse::from_value(raw_response);
        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<WatchlistResultResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeWatchlistCheck
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}

#[async_trait]
impl VendorAPICall<IncodeUpdatedWatchlistResultRequest, IncodeResponse<UpdatedWatchlistResultResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "IncodeUpdatedWatchlistResultRequest")
    )]
    async fn make_request(
        &self,
        request: IncodeUpdatedWatchlistResultRequest,
    ) -> FpResult<IncodeResponse<UpdatedWatchlistResultResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .updated_watchlist_result(self, &request.ref_)
            .await?;

        let result = IncodeResponse::from_value(raw_response);

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<UpdatedWatchlistResultResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeUpdatedWatchlistResult
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone()) // TODO: why do have a
                                                                     // IncodeRawResponse again ??
    }
}

#[async_trait]
impl VendorAPICall<IncodeCurpValidationRequest, IncodeResponse<CurpValidationResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument("make_request", skip_all, fields(request = "IncodeCurpValidationRequest"))]
    async fn make_request(
        &self,
        request: IncodeCurpValidationRequest,
    ) -> FpResult<IncodeResponse<CurpValidationResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.curp_validation(self, request.curp).await?;

        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<CurpValidationResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeCurpValidation
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // we don't use incode in this way
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone()) // TODO: why do have a
                                                                     // IncodeRawResponse again ??
                                                                     // idk i forget
    }
}

#[async_trait]
impl VendorAPICall<IncodeGovernmentValidationRequest, IncodeResponse<GovernmentValidationResponse>>
    for FootprintVendorHttpClient
{
    #[tracing::instrument(
        "make_request",
        skip_all,
        fields(request = "IncodeGovernmentValidationRequest")
    )]
    async fn make_request(
        &self,
        request: IncodeGovernmentValidationRequest,
    ) -> FpResult<IncodeResponse<GovernmentValidationResponse>> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .government_validation(self, request.config)
            .await?;

        let result = IncodeResponse::from_response(raw_response).await;

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<GovernmentValidationResponse> {
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IncodeGovernmentValidation
    }

    fn raw_response(&self) -> newtypes::PiiJsonValue {
        self.raw_response.clone()
    }

    // TODO: rm this and ParsedResponse
    fn parsed_response(&self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response.clone())
    }
}
