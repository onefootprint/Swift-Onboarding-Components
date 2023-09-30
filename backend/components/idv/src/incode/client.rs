use super::doc::request::{
    AddDocumentSideRequest, AddMLConsent, AddPrivacyConsent, AddSelfieRequest, DocumentSide,
};
use super::doc::response::GetOnboardingStatusResponse;
use super::watchlist::request::WatchlistResultRequest;
use super::{
    request::{OnboardingStartCustomNameFields, OnboardingStartRequest},
    response::OnboardingStartResponse,
    IncodeAPIResult,
};
use crate::{footprint_http_client::FootprintVendorHttpClient, incode::error::Error as IncodeError};
use newtypes::{
    vendor_credentials::IncodeCredentials, DocVData, IdDocKind, IncodeConfigurationId, IncodeSessionId,
    PiiString,
};
use newtypes::{IncodeVerificationSessionId, IncodeVerificationSessionKind, IncodeWatchlistResultRef};
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
    ) -> Result<serde_json::Value, IncodeError> {
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
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }
}

impl AuthenticatedIncodeClientAdapter {
    pub async fn add_document(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        docv_data: DocVData,
        document_side: DocumentSide,
    ) -> Result<serde_json::Value, IncodeError> {
        let document_type = docv_data
            .document_type
            .ok_or(IncodeError::AssertionError("Missing document type".into()))?;

        let url = self
            .client_adapter
            .api_url(url_path_for_document_side(&document_type, &document_side).as_str())?;
        let request = AddDocumentSideRequest {
            base_64_image: image_from_side(docv_data, document_side)?,
        };

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        let (cl, s) = (response.content_length(), response.status());

        let json = match response.json().await {
            Ok(j) => Ok(j),
            Err(e) => {
                tracing::error!(http_status=%s, content_length=?cl, err_msg=%e.to_string(), "error parsing incode response as json");

                Err(e)
            }
        }?;

        Ok(json)
    }

    pub async fn process_id(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/process/id")?;

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }

    pub async fn add_privacy_consent(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        title: String,
        content: String,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/add/user-consent")?;
        let request = AddPrivacyConsent::new(title, content);

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

    pub async fn add_ml_consent(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        status: bool,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/add/ml-consent")?;
        let request: AddMLConsent = AddMLConsent { status };

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

    pub async fn add_selfie(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        docv_data: DocVData,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self
            .client_adapter
            .api_url("omni/add/face/third-party?imageType=selfie")?;
        let request: AddSelfieRequest = AddSelfieRequest {
            base_64_image: docv_data
                .selfie_image
                .ok_or(IncodeError::AssertionError("missing selfie image".into()))?,
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

    pub async fn fetch_scores(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/score")?;

        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }

    pub async fn fetch_ocr(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/ocr-data")?;

        let response = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }

    // Note: should be called _after_ selfie, front, back and process-id
    #[allow(unused)]
    pub async fn process_face(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/process/face")?;

        let response = footprint_http_client
            .client
            .post(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        Ok(response)
    }

    async fn get_onboarding_status(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        session_kind: IncodeVerificationSessionKind,
        incode_verification_session_id: IncodeVerificationSessionId,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/get/onboarding/status")?;
        let response: serde_json::Value = footprint_http_client
            .client
            .get(url)
            .headers(self.client_adapter.default_headers.clone())
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?
            .json()
            .await?;

        let parsed: GetOnboardingStatusResponse = serde_json::from_value(response.clone())?;
        if !parsed.ready(&session_kind) {
            tracing::info!(status=%parsed.onboarding_status, session_kind=%session_kind, incode_verification_session_id=%incode_verification_session_id, "incode GetOnboardingStatusResponse not ready");
            return Err(IncodeError::ResultsNotReady);
        }

        Ok(response)
    }

    fn session_results_are_not_ready(error: &IncodeError) -> bool {
        matches!(error, IncodeError::ResultsNotReady)
    }

    // TODO: make this a reusable strategy across vendor requests, either on http client or on VendorAPICall
    pub async fn poll_get_onboarding_status(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        session_kind: IncodeVerificationSessionKind,
        incode_verification_session_id: IncodeVerificationSessionId,
    ) -> Result<serde_json::Value, IncodeError> {
        let retry_strategy = FixedInterval::from_millis(1000).take(30);

        let response = RetryIf::spawn(
            retry_strategy,
            || {
                self.get_onboarding_status(
                    footprint_http_client,
                    session_kind.to_owned(),
                    incode_verification_session_id.to_owned(),
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
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self.client_adapter.api_url("omni/watchlist-result")?;

        let first_name = match (first_name, middle_name) {
            (None, None) => None,
            (None, Some(m)) => Some(m),
            (Some(f), None) => Some(f),
            (Some(f), Some(m)) => Some(format!("{} {}", f.leak(), m.leak()).into()),
        };

        let request = WatchlistResultRequest {
            first_name,
            sur_name: last_name,
            birth_year: dob_year.map(|s| s.leak().parse::<f32>()).transpose()?,
            fuzziness: None, //TODO: figure out how we want to set this
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
        let parsed = IncodeAPIResult::<OnboardingStartResponse>::try_from(result)?.into_success()?;

        self.client_adapter.update_header_with_token(parsed.token)
    }
}

fn url_path_for_document_side(document_type: &IdDocKind, document_side: &DocumentSide) -> String {
    // Not all documents have backs
    let front_only = document_type.front_only();

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
    use newtypes::{
        vendor_credentials::IncodeCredentials, DocVData, IdDocKind, IncodeConfigurationId,
        IncodeVerificationSessionId, IncodeVerificationSessionKind, PiiString,
    };

    use crate::{
        footprint_http_client::FootprintVendorHttpClient,
        incode::{
            doc::request::DocumentSide,
            doc::response::{
                AddSideResponse, FetchOCRResponse, FetchScoresResponse, ProcessFaceResponse,
                ProcessIdResponse,
            },
            response::OnboardingStartResponse,
            watchlist::response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
            IncodeAPIResult,
        },
        tests::fixtures::images::load_image_and_encode_as_b64,
    };

    use super::{AuthenticatedIncodeClientAdapter, IncodeClientAdapter};
    const INCODE_SANDBOX_SELFIE_FLOW_ID: &str = "643d8b43313fd2f4aa6b3b9f";

    pub fn load_client() -> IncodeClientAdapter {
        let creds = IncodeCredentials {
            api_key: PiiString::from(dotenv::var("INCODE_API_KEY").unwrap()),
            base_url: PiiString::from(dotenv::var("INCODE_BASE_URL").unwrap()),
        };

        IncodeClientAdapter::new(creds).expect("couldn't load incode client")
    }

    async fn get_authed_client() -> (FootprintVendorHttpClient, AuthenticatedIncodeClientAdapter) {
        let client = load_client();
        let fp_client = FootprintVendorHttpClient::new().unwrap();
        // Start the session
        let config = IncodeConfigurationId::from(INCODE_SANDBOX_SELFIE_FLOW_ID.to_string());
        let res = client
            .onboarding_start(&fp_client, Some(config), None, None)
            .await
            .unwrap();

        let parsed = IncodeAPIResult::<OnboardingStartResponse>::try_from(res)
            .unwrap()
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
        let (fp_client, authenticated_client) = get_authed_client().await;

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
        IncodeAPIResult::<AddSideResponse>::try_from(raw_front_add_side_res)
            .unwrap()
            .into_success()
            .unwrap();

        let raw_back_add_side_res = authenticated_client
            .add_document(&fp_client, back_docv_data, DocumentSide::Back)
            .await
            .expect("add side failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::try_from(raw_back_add_side_res)
            .unwrap()
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
        IncodeAPIResult::<AddSideResponse>::try_from(selfie_res)
            .unwrap()
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
        IncodeAPIResult::<ProcessIdResponse>::try_from(raw_process_res)
            .unwrap()
            .into_success()
            .unwrap();
        //
        // Process face now
        //
        let raw_process_face = authenticated_client
            .process_face(&fp_client)
            .await
            .expect("process face failed");

        IncodeAPIResult::<ProcessFaceResponse>::try_from(raw_process_face)
            .unwrap()
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
            )
            .await
            .expect("results weren't ready after polling!");
        //
        // Fetch Scores
        //
        let raw_fetch_scores_res = authenticated_client
            .fetch_scores(&fp_client)
            .await
            .expect("fetch scores failed");

        let scores = IncodeAPIResult::<FetchScoresResponse>::try_from(raw_fetch_scores_res)
            .unwrap()
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

        let ocr = IncodeAPIResult::<FetchOCRResponse>::try_from(raw_get_ocr)
            .unwrap()
            .into_success()
            .unwrap();
        assert!(ocr.name.clone().unwrap().full_name.is_some());
        assert_eq!(
            ocr.address_fields.clone().unwrap().state.unwrap(),
            "MA".to_string().into()
        );

        assert_eq!(ocr.expiration_date().unwrap().leak(), "2024-10-15");
        assert_eq!(ocr.dob().unwrap().leak(), "1986-10-16");
    }

    #[ignore]
    #[tokio::test]
    async fn test_watchlist_result() {
        let (fp_client, authenticated_client) = get_authed_client().await;

        let raw_res = authenticated_client
            .watchlist_result(
                &fp_client,
                Some(PiiString::from("Bob")),
                Some(PiiString::from("Billy")),
                Some(PiiString::from("Boberto")),
                None,
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
}
