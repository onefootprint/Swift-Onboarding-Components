use async_trait::async_trait;
use idv::{
    footprint_http_client::FootprintVendorHttpClient,
    incode::{
        client::{AuthenticatedIncodeClientAdapter, IncodeClientAdapter},
        doc::request::DocumentSide,
        doc::response::{
            AddConsentResponse, AddSideResponse, FetchOCRResponse, FetchScoresResponse, ProcessIdResponse,
        },
        doc::{
            IncodeAddBackRequest, IncodeAddFrontRequest, IncodeAddMLConsentRequest,
            IncodeAddPrivacyConsentRequest, IncodeFetchOCRRequest, IncodeFetchScoresRequest,
            IncodeProcessIdRequest,
        },
        error::Error as IncodeError,
        response::OnboardingStartResponse,
        IncodeAPIResult, IncodeResponse, IncodeStartOnboardingRequest,
    },
    ParsedResponse,
};
use newtypes::VendorAPI;

use super::{VendorAPICall, VendorAPIResponse};

//////////////////////
/// Incode impl
/// /////////////////
#[async_trait]
impl VendorAPICall<IncodeStartOnboardingRequest, IncodeResponse<OnboardingStartResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeStartOnboardingRequest,
    ) -> Result<IncodeResponse<OnboardingStartResponse>, IncodeError> {
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
        let result = IncodeResponse::<OnboardingStartResponse> {
            result: IncodeAPIResult::<OnboardingStartResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<OnboardingStartResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::IncodeStartOnboarding
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddFrontRequest, IncodeResponse<AddSideResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeAddFrontRequest,
    ) -> Result<IncodeResponse<AddSideResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_document(self, request.docv_data, DocumentSide::Front)
            .await?;
        let result = IncodeResponse::<AddSideResponse> {
            result: IncodeAPIResult::<AddSideResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<AddSideResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        // this isn't correct, so don't use it :)
        // 2 VendorAPIs use the same result struct
        unimplemented!()
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddBackRequest, IncodeResponse<AddSideResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeAddBackRequest,
    ) -> Result<IncodeResponse<AddSideResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_document(self, request.docv_data, DocumentSide::Back)
            .await?;
        let result = IncodeResponse::<AddSideResponse> {
            result: IncodeAPIResult::<AddSideResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

#[async_trait]
impl VendorAPICall<IncodeProcessIdRequest, IncodeResponse<ProcessIdResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeProcessIdRequest,
    ) -> Result<IncodeResponse<ProcessIdResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.process_id(self).await?;
        let result = IncodeResponse::<ProcessIdResponse> {
            result: IncodeAPIResult::<ProcessIdResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<ProcessIdResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeProcessId
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}

#[async_trait]
impl VendorAPICall<IncodeFetchScoresRequest, IncodeResponse<FetchScoresResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeFetchScoresRequest,
    ) -> Result<IncodeResponse<FetchScoresResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.fetch_scores(self).await?;
        let result = IncodeResponse::<FetchScoresResponse> {
            result: IncodeAPIResult::<FetchScoresResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<FetchScoresResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeFetchScores
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}

//
// Consent
//
#[async_trait]
impl VendorAPICall<IncodeAddPrivacyConsentRequest, IncodeResponse<AddConsentResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeAddPrivacyConsentRequest,
    ) -> Result<IncodeResponse<AddConsentResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client
            .add_privacy_consent(self, request.title, request.content)
            .await?;
        let result = IncodeResponse::<AddConsentResponse> {
            result: IncodeAPIResult::<AddConsentResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

#[async_trait]
impl VendorAPICall<IncodeAddMLConsentRequest, IncodeResponse<AddConsentResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeAddMLConsentRequest,
    ) -> Result<IncodeResponse<AddConsentResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.add_ml_consent(self, request.status).await?;
        let result = IncodeResponse::<AddConsentResponse> {
            result: IncodeAPIResult::<AddConsentResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<AddConsentResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        // this isn't correct
        VendorAPI::IncodeAddPrivacyConsent
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}

#[async_trait]
impl VendorAPICall<IncodeFetchOCRRequest, IncodeResponse<FetchOCRResponse>, IncodeError>
    for FootprintVendorHttpClient
{
    async fn make_request(
        &self,
        request: IncodeFetchOCRRequest,
    ) -> Result<IncodeResponse<FetchOCRResponse>, IncodeError> {
        // derive is_prod from creds
        let client = IncodeClientAdapter::new(request.credentials.credentials.clone())?;
        let authenticated_client =
            AuthenticatedIncodeClientAdapter::new(client, request.credentials.authentication_token)?;

        let raw_response = authenticated_client.fetch_ocr(self).await?;
        let result = IncodeResponse::<FetchOCRResponse> {
            result: IncodeAPIResult::<FetchOCRResponse>::try_from(raw_response.clone())?,
            raw_response,
        };

        Ok(result)
    }
}

impl VendorAPIResponse for IncodeResponse<FetchOCRResponse> {
    fn vendor_api(self) -> newtypes::VendorAPI {
        VendorAPI::IncodeFetchOCR
    }

    fn raw_response(self) -> newtypes::PiiJsonValue {
        self.raw_response.into()
    }

    // we don't use incode in this way
    fn parsed_response(self) -> ParsedResponse {
        ParsedResponse::IncodeRawResponse(self.raw_response)
    }
}
