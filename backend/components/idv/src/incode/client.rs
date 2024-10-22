use super::curp_validation::request::CurpValidationRequest;
use super::doc::request::AddDocumentSideRequest;
use super::doc::request::AddMLConsent;
use super::doc::request::AddPrivacyConsent;
use super::doc::request::AddSelfieRequest;
use super::doc::request::DocumentSide;
use super::doc::response::GetOnboardingStatusResponse;
use super::government_validation::request::GovernmentValidationRequestQueryParams;
use super::request::OnboardingStartCustomNameFields;
use super::request::OnboardingStartRequest;
use super::response::OnboardingStartResponse;
use super::watchlist::request::WatchlistResultRequest;
use super::IncodeAPIResult;
use crate::footprint_http_client::FootprintVendorHttpClient;
use crate::footprint_http_client::FpVendorClientArgs;
use crate::incode::error::Error as IncodeError;
use newtypes::vendor_credentials::IncodeCredentials;
use newtypes::AmlMatchKind;
use newtypes::DocVData;
use newtypes::DocumentKind;
use newtypes::IdDocKind;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeSessionId;
use newtypes::IncodeVerificationSessionId;
use newtypes::IncodeVerificationSessionKind;
use newtypes::IncodeWatchlistResultRef;
use newtypes::PiiString;
use reqwest::header;
use tokio_retry::strategy::FixedInterval;
use tokio_retry::RetryIf;

#[derive(Clone)]
pub struct IncodeClientAdapter {
    base_url: String,
    default_headers: header::HeaderMap,
}

impl IncodeClientAdapter {
    fn api_url(&self, path: &str) -> Result<String, IncodeError> {
        if path.starts_with('/') {
            return Err(IncodeError::SendError(
                "path suffix should not start with leading /".into(),
            ));
        }
        Ok(format!("{}/{}", self.base_url, path))
    }
}

#[derive(Clone)]
/// A struct that represents a client that has an Authorization token to be reused across API calls
pub struct AuthenticatedIncodeClientAdapter {
    client_adapter: IncodeClientAdapter,
}

impl AuthenticatedIncodeClientAdapter {
    pub fn new(
        mut incode_client_adapter: IncodeClientAdapter,
        auth_token: PiiString,
    ) -> Result<Self, IncodeError> {
        incode_client_adapter.update_header_with_token(auth_token)?;

        Ok(Self {
            client_adapter: incode_client_adapter,
        })
    }
}

impl IncodeClientAdapter {
    pub fn new(credentials: IncodeCredentials) -> Result<Self, IncodeError> {
        let base_url = credentials.base_url.leak_to_string();

        // These must be present on every api call
        let mut headers = header::HeaderMap::new();
        headers.insert("api-version", header::HeaderValue::from_str("1.0")?);
        headers.insert(
            "x-api-key",
            header::HeaderValue::from_str(credentials.api_key.leak())?,
        );
        headers.insert("Content-Type", header::HeaderValue::from_str("application/json")?);

        let res = Self {
            base_url,
            default_headers: headers,
        };

        Ok(res)
    }

    // Updates headers with authorization token required for making requests to Incode's API
    pub fn update_header_with_token(&mut self, auth_token: PiiString) -> Result<(), IncodeError> {
        let tok_header_val = header::HeaderValue::from_str(auth_token.leak())?;
        let token = self
            .default_headers
            .entry("X-Incode-Hardware-Id")
            .or_insert(tok_header_val.clone());
        *token = tok_header_val;

        Ok(())
    }
}

impl IncodeClientAdapter {
    pub async fn onboarding_start(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        configuration_id: Option<IncodeConfigurationId>,
        // used to fetch a new token for requests
        incode_session_id: Option<IncodeSessionId>,
        custom_name_fields: Option<OnboardingStartCustomNameFields>,
    ) -> Result<reqwest::Response, IncodeError> {
        let path = "omni/start";
        let request = OnboardingStartRequest {
            country_code: "ALL".into(),
            // TODO (link OB?)
            external_id: None,
            configuration_id,
            interview_id: incode_session_id,
            language: "en-US".into(),
            custom_fields: custom_name_fields,
        };

        let response = footprint_http_client
            .client
            .post(self.api_url(path)?)
            .headers(self.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }
}

impl AuthenticatedIncodeClientAdapter {
    pub async fn add_document(
        &self,
        _: &FootprintVendorHttpClient,
        docv_data: DocVData,
        document_side: DocumentSide,
    ) -> Result<reqwest::Response, IncodeError> {
        let document_type = docv_data
            .document_type
            .ok_or(IncodeError::AssertionError("Missing document type".into()))?;

        let url = self
            .client_adapter
            .api_url(url_path_for_document_side(&document_type, &document_side).as_str())?;
        let request = AddDocumentSideRequest {
            base_64_image: image_from_side(docv_data, document_side)?,
        };

        // There isn't a way to specify the max number of retries on a per request basis... without
        // heavy surgery to the open-source reqwest-retry library.
        // For now, just creating a new client here
        let args = FpVendorClientArgs { num_retries: Some(1) };
        let fp_client = FootprintVendorHttpClient::new(args)
            .map_err(|_| IncodeError::AssertionError("Couldn't construct client".into()))?;
        let response = fp_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn process_id(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/process/id")?;

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn add_privacy_consent(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        title: String,
        content: String,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/add/user-consent")?;
        let request = AddPrivacyConsent::new(title, content);

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn add_ml_consent(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        status: bool,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/add/ml-consent")?;
        let request: AddMLConsent = AddMLConsent { status };

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn add_selfie(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        docv_data: DocVData,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self
            .client_adapter
            .api_url("omni/add/face/third-party?imageType=selfie")?;
        let request: AddSelfieRequest = AddSelfieRequest {
            base_64_image: docv_data
                .selfie_image
                .ok_or(IncodeError::AssertionError("missing selfie image".into()))?,
        };

        footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))
    }

    pub async fn fetch_scores(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/score")?;

        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn fetch_ocr(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/ocr-data")?;

        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    // Note: should be called _after_ selfie, front, back and process-id
    pub async fn process_face(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/process/face")?;

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    async fn get_onboarding_status(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        session_kind: IncodeVerificationSessionKind,
        incode_verification_session_id: IncodeVerificationSessionId,
        skip_wait_for_selfie: bool,
        // need to return json here since we deser to know if we poll
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/onboarding/status")?;
        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        let (result, json) = IncodeAPIResult::<GetOnboardingStatusResponse>::from_response(response).await;

        let parsed_result = result.into_success()
            // retry any error we get
            .map_err(|_| IncodeError::ResultsNotReady)?;

        if !parsed_result.ready(&session_kind, skip_wait_for_selfie) {
            tracing::info!(status=%parsed_result.onboarding_status, session_kind=%session_kind, incode_verification_session_id=%incode_verification_session_id, skip_wait_for_selfie=skip_wait_for_selfie, "incode GetOnboardingStatusResponse not ready");
            return Err(IncodeError::ResultsNotReady);
        }

        Ok(json)
    }

    pub async fn mark_session_complete(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/finish-status")?;
        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn add_customer(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("omni/process/approve")?;
        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    fn session_results_are_not_ready(error: &IncodeError) -> bool {
        matches!(error, IncodeError::ResultsNotReady)
    }

    // TODO: make this a reusable strategy across vendor requests, either on http client or on
    // VendorAPICall
    pub async fn poll_get_onboarding_status(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        session_kind: IncodeVerificationSessionKind,
        incode_verification_session_id: IncodeVerificationSessionId,
        wait_for_selfie: bool,
    ) -> Result<serde_json::Value, IncodeError> {
        let retry_strategy = FixedInterval::from_millis(1000).take(10);

        let response = RetryIf::spawn(
            retry_strategy,
            || {
                self.get_onboarding_status(
                    footprint_http_client,
                    session_kind.to_owned(),
                    incode_verification_session_id.to_owned(),
                    wait_for_selfie,
                )
            },
            Self::session_results_are_not_ready,
        )
        .await
        .map_err(IncodeError::from)?;

        Ok(response)
    }

    pub async fn watchlist_result(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        first_name: Option<PiiString>,
        middle_name: Option<PiiString>,
        last_name: Option<PiiString>,
        dob_year: Option<PiiString>,
        match_kind: AmlMatchKind,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/watchlist-result")?;

        let first_name = match (first_name, middle_name) {
            (None, None) => None,
            (None, Some(m)) => Some(m),
            (Some(f), None) => Some(f),
            (Some(f), Some(m)) => Some(format!("{} {}", f.leak(), m.leak()).into()),
        };

        let fuzziness = match match_kind {
            AmlMatchKind::ExactNameAndDobYear => Some(0.1),
            AmlMatchKind::ExactName => Some(0.1),
            AmlMatchKind::FuzzyHigh => Some(1.0),
            AmlMatchKind::FuzzyMedium => Some(0.7),
            AmlMatchKind::FuzzyLow => Some(0.3),
        };

        let request = WatchlistResultRequest {
            first_name,
            sur_name: last_name,
            birth_year: dob_year.map(|s| s.leak().parse::<f32>()).transpose()?,
            fuzziness,
        };

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }

    pub async fn curp_validation(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        curp: PiiString,
    ) -> Result<reqwest::Response, IncodeError> {
        let url = self.client_adapter.api_url("api/validate/curp/v4")?;
        let request = CurpValidationRequest { curp };

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn government_validation<T>(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        request: T,
    ) -> Result<reqwest::Response, IncodeError>
    where
        T: Into<GovernmentValidationRequestQueryParams>,
    {
        let url = self
            .client_adapter
            .api_url("omni/process/government-validation")?;
        let request = request.into();

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .query(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response)
    }

    pub async fn updated_watchlist_result(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        watchlist_result_ref: &IncodeWatchlistResultRef,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/updated-watchlist-result")?;
        let url = format!("{}?ref={}", url, watchlist_result_ref);
        tracing::info!(url=?url, "updated_watchlist_result");

        let res = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|e| IncodeError::SendError(e.to_string()))?
            .json()
            .await?;

        Ok(res)
    }

    /// Update authentication token by requesting a new one w/ the verification session id
    pub async fn update_authentication_token(
        &mut self,
        footprint_http_client: &FootprintVendorHttpClient,
        incode_session_id: IncodeSessionId,
    ) -> Result<(), IncodeError> {
        let result = self
            .client_adapter
            .onboarding_start(footprint_http_client, None, Some(incode_session_id), None)
            .await?;
        let parsed = IncodeAPIResult::<OnboardingStartResponse>::from_response(result)
            .await
            .0
            .into_success()?;

        self.client_adapter.update_header_with_token(parsed.token)
    }
}

fn url_path_for_document_side(document_type: &IdDocKind, document_side: &DocumentSide) -> String {
    // Not all documents have backs
    let front_only = DocumentKind::from(*document_type).sides() == vec![newtypes::DocumentSide::Front];

    match document_side {
        DocumentSide::Front => {
            format!("omni/add/front-id/v2?onlyFront={front_only}")
        }
        // For now, we always will restart the session if we need to re-collect the document
        DocumentSide::Back => "omni/add/back-id/v2?retry=false".to_string(),
    }
}

fn image_from_side(docv_data: DocVData, side: DocumentSide) -> Result<PiiString, IncodeError> {
    let image = match side {
        DocumentSide::Front => docv_data
            .front_image
            .ok_or(IncodeError::AssertionError("Missing front image".into()))?,
        DocumentSide::Back => docv_data
            .back_image
            .ok_or(IncodeError::AssertionError("Missing back image".into()))?,
    };

    Ok(image)
}

#[cfg(test)]
mod tests {
    use super::AuthenticatedIncodeClientAdapter;
    use super::IncodeClientAdapter;
    use crate::footprint_http_client::FootprintVendorHttpClient;
    use crate::footprint_http_client::FpVendorClientArgs;
    use crate::incode::curp_validation::response::CurpValidationResponse;
    use crate::incode::doc::request::DocumentSide;
    use crate::incode::doc::response::AddCustomerResponse;
    use crate::incode::doc::response::AddSideResponse;
    use crate::incode::doc::response::FetchOCRResponse;
    use crate::incode::doc::response::FetchScoresResponse;
    use crate::incode::doc::response::ProcessFaceResponse;
    use crate::incode::doc::response::ProcessIdResponse;
    use crate::incode::government_validation::request::GovernmentValidationConfigByCountry;
    use crate::incode::government_validation::request::MXRequestConfig;
    use crate::incode::government_validation::response::GovernmentValidationResponse;
    use crate::incode::government_validation::response::MXStatusCode;
    use crate::incode::response::OnboardingStartResponse;
    use crate::incode::watchlist::response::UpdatedWatchlistResultResponse;
    use crate::incode::watchlist::response::WatchlistResultResponse;
    use crate::incode::IncodeAPIResult;
    use crate::incode::IncodeResponse;
    use crate::tests::fixtures::images::load_image_and_encode_as_b64;
    use newtypes::incode::IncodeStatus;
    use newtypes::vendor_credentials::IncodeCredentials;
    use newtypes::AmlMatchKind;
    use newtypes::DocVData;
    use newtypes::IdDocKind;
    use newtypes::IncodeConfigurationId;
    use newtypes::IncodeSessionId;
    use newtypes::IncodeVerificationSessionId;
    use newtypes::IncodeVerificationSessionKind;
    use newtypes::PiiString;
    const INCODE_SANDBOX_SELFIE_FLOW_ID: &str = "643d8b43313fd2f4aa6b3b9f";

    pub fn load_client() -> IncodeClientAdapter {
        let creds = IncodeCredentials {
            api_key: PiiString::from(dotenv::var("INCODE_API_KEY").unwrap()),
            base_url: PiiString::from(dotenv::var("INCODE_BASE_URL").unwrap()),
        };

        IncodeClientAdapter::new(creds).expect("couldn't load incode client")
    }

    async fn get_authed_client(
        flow_id: &str,
        incode_session_id: Option<String>,
    ) -> (FootprintVendorHttpClient, AuthenticatedIncodeClientAdapter) {
        let client = load_client();
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();
        // Start the session
        let config = IncodeConfigurationId::from(flow_id.to_string());
        let res = client
            .onboarding_start(
                &fp_client,
                Some(config),
                incode_session_id.map(IncodeSessionId::from),
                None,
            )
            .await
            .unwrap();

        let parsed = IncodeAPIResult::<OnboardingStartResponse>::from_response(res)
            .await
            .0
            .into_success()
            .unwrap();

        // Use token we got from omni/start to authenticate future requests
        (
            fp_client,
            AuthenticatedIncodeClientAdapter::new(client, parsed.token).unwrap(),
        )
    }

    #[ignore]
    #[tokio::test]
    async fn test_document_upload_e2e() {
        let (fp_client, authenticated_client) = get_authed_client(INCODE_SANDBOX_SELFIE_FLOW_ID, None).await;

        let front_docv_data = DocVData {
            front_image: Some(PiiString::from(
                load_image_and_encode_as_b64("fake_incode_front.jpg").0,
            )),
            document_type: Some(IdDocKind::DriversLicense),
            ..Default::default()
        };
        let back_docv_data = DocVData {
            back_image: Some(PiiString::from(
                load_image_and_encode_as_b64("fake_incode_back.jpg").0,
            )),
            document_type: Some(IdDocKind::DriversLicense),
            ..Default::default()
        };
        let selfie_docv_data = DocVData {
            selfie_image: Some(PiiString::from(load_image_and_encode_as_b64("fake_selfie.jpg").0)),
            document_type: Some(IdDocKind::DriversLicense),
            ..Default::default()
        };

        //
        // Add document sides
        //
        let raw_front_add_side_res = authenticated_client
            .add_document(&fp_client, front_docv_data, DocumentSide::Front)
            .await
            .expect("add side failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::from_response(raw_front_add_side_res)
            .await
            .0
            .into_success()
            .unwrap();

        let raw_back_add_side_res = authenticated_client
            .add_document(&fp_client, back_docv_data, DocumentSide::Back)
            .await
            .expect("add side failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::from_response(raw_back_add_side_res)
            .await
            .0
            .into_success()
            .unwrap();

        //
        // Add selfie
        //
        let selfie_res = authenticated_client
            .add_selfie(&fp_client, selfie_docv_data)
            .await
            .expect("add selfie failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::from_response(selfie_res)
            .await
            .0
            .into_success()
            .unwrap();
        //
        // check status
        //
        let status_res = authenticated_client
            .poll_get_onboarding_status(
                &fp_client,
                IncodeVerificationSessionKind::Selfie,
                IncodeVerificationSessionId::from("ivs1234".to_string()),
                true,
            )
            .await;
        assert!(status_res.is_err());

        //
        // Process the ID
        //
        let raw_process_res = authenticated_client
            .process_id(&fp_client)
            .await
            .expect("process id failed");
        // check we can deser
        IncodeAPIResult::<ProcessIdResponse>::from_response(raw_process_res)
            .await
            .0
            .into_success()
            .unwrap();
        //
        // Process face now
        //
        let raw_process_face = authenticated_client
            .process_face(&fp_client)
            .await
            .expect("process face failed");

        IncodeAPIResult::<ProcessFaceResponse>::from_response(raw_process_face)
            .await
            .0
            .into_success()
            .unwrap();

        //
        // check status
        //
        authenticated_client
            .poll_get_onboarding_status(
                &fp_client,
                IncodeVerificationSessionKind::Selfie,
                IncodeVerificationSessionId::from("ivs1234".to_string()),
                true,
            )
            .await
            .expect("results weren't ready after polling!");
        //
        // Fetch Scores
        //
        let add_customer_res = authenticated_client
            .add_customer(&fp_client)
            .await
            .expect("add customer failed");

        // selfie is a monkey picture, so i think maybe incode doesn't store monkey pics since monkeys
        // cannot consent to BIPA or GDPR
        let customer_res = IncodeAPIResult::<AddCustomerResponse>::from_response(add_customer_res)
            .await
            .0
            .into_success()
            .unwrap();

        assert!(!customer_res.success);

        let raw_fetch_scores_res = authenticated_client
            .fetch_scores(&fp_client)
            .await
            .expect("fetch scores failed");

        let scores = IncodeAPIResult::<FetchScoresResponse>::from_response(raw_fetch_scores_res)
            .await
            .0
            .into_success()
            .unwrap();
        assert!(scores.id_validation.is_some());

        //
        // Get OCR
        //
        let raw_get_ocr = authenticated_client
            .fetch_ocr(&fp_client)
            .await
            .expect("fetch ocr failed");

        let ocr = IncodeAPIResult::<FetchOCRResponse>::from_response(raw_get_ocr)
            .await
            .0
            .into_success()
            .unwrap();
        assert!(ocr.name.clone().unwrap().full_name.is_some());
        assert_eq!(
            ocr.address_fields.clone().unwrap().state.unwrap(),
            "MA".to_string().into()
        );

        assert_eq!(ocr.expiration_date().unwrap().leak(), "2050-10-15");
        assert_eq!(ocr.dob().unwrap().leak(), "1986-10-16");
    }

    #[ignore]
    #[tokio::test]
    async fn test_watchlist_result() {
        let (fp_client, authenticated_client) = get_authed_client(INCODE_SANDBOX_SELFIE_FLOW_ID, None).await;

        let raw_res = authenticated_client
            .watchlist_result(
                &fp_client,
                Some(PiiString::from("Bob")),
                Some(PiiString::from("Billy")),
                Some(PiiString::from("Boberto")),
                None,
                AmlMatchKind::default(),
            )
            .await
            .unwrap();

        let parsed = IncodeAPIResult::<WatchlistResultResponse>::try_from(raw_res)
            .unwrap()
            .into_success()
            .unwrap();

        assert_eq!("success", parsed.status.unwrap());
        assert_eq!(
            "Bob Billy Boberto",
            parsed
                .content
                .as_ref()
                .unwrap()
                .data
                .as_ref()
                .unwrap()
                .search_term
                .as_ref()
                .unwrap()
                .leak()
        );

        // test updated-watchlist-result
        let ref_ = parsed.content.unwrap().data.unwrap().ref_.unwrap();
        let res = authenticated_client
            .updated_watchlist_result(&fp_client, &ref_)
            .await
            .unwrap();

        let parsed = IncodeAPIResult::<UpdatedWatchlistResultResponse>::try_from(res)
            .unwrap()
            .into_success()
            .unwrap();
        assert_eq!("success", parsed.status.as_ref().unwrap());
        assert_eq!(
            ref_,
            parsed
                .content
                .as_ref()
                .unwrap()
                .data
                .as_ref()
                .unwrap()
                .ref_
                .as_ref()
                .unwrap()
                .clone()
        );
    }

    #[ignore]
    #[tokio::test]
    async fn test_curp_validation_result() {
        let (fp_client, authenticated_client) = get_authed_client("65e241cbac19b78faa5d22e3", None).await;

        let raw_res = authenticated_client
            .curp_validation(
                &fp_client,
                PiiString::from(crate::test_incode_fixtures::TEST_CURP),
            )
            .await
            .unwrap();

        let resp = IncodeResponse::<CurpValidationResponse>::from_response(raw_res)
            .await
            .result
            .into_success()
            .unwrap();

        // we get a curp not found error with this one
        assert_eq!(resp.error.unwrap().codigo_error.unwrap(), String::from("06"));
        assert!(!resp.renapo_valid.unwrap());
    }

    #[ignore]
    #[tokio::test]
    async fn test_government_validation_result() {
        // this session is in demo and is a mx doc
        let session_id = "65d8e7d249ef953b4bfbcf8e";
        let (fp_client, authenticated_client) =
            get_authed_client("660eb3bddaefaeac1c74a029", Some(session_id.to_string())).await;
        let request_config = GovernmentValidationConfigByCountry::Mexico(MXRequestConfig::ScrapingOnly);

        let raw_res = authenticated_client
            .government_validation(&fp_client, request_config)
            .await
            .unwrap();

        let resp = IncodeResponse::<GovernmentValidationResponse>::from_response(raw_res)
            .await
            .result
            .into_success()
            .unwrap();

        assert_eq!(resp.overall_status().unwrap(), IncodeStatus::Fail);
        assert_eq!(resp.status_code(), MXStatusCode::UserNotFoundInIneDb);
    }
}
