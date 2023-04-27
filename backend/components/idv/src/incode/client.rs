use crate::{footprint_http_client::FootprintVendorHttpClient, incode::error::Error as IncodeError};
use newtypes::{
    vendor_credentials::IncodeCredentials, IdDocKind, IncodeConfigurationId, IncodeSessionId, PiiString,
};
use reqwest::header;

use super::{
    request::{AddDocumentSideRequest, DocumentSide, OnboardingStartRequest},
    response::OnboardingStartResponse,
    IncodeAPIResult,
};
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
    pub fn new(is_production: bool, credentials: IncodeCredentials) -> Result<Self, IncodeError> {
        let base_url = if is_production {
            Err(IncodeError::SendError("not enabled in production".into()))
        } else {
            Ok("https://demo-api.incodesmile.com".into())
        }?;

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
    ) -> Result<serde_json::Value, IncodeError> {
        let path = "omni/start";
        let request = OnboardingStartRequest {
            country_code: "ALL".into(),
            // TODO (link OB?)
            external_id: None,
            configuration_id,
            interview_id: incode_session_id,
            language: "en-US".into(),
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
        config: AddDocumentRequest,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = self
            .client_adapter
            .api_url(url_path_for_document_side(&config).as_str())?;
        let request = AddDocumentSideRequest {
            base_64_image: config.image.to_owned(),
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

    /// Update authentication token by requesting a new one w/ the verification session id
    pub async fn update_authentication_token(
        &mut self,
        footprint_http_client: &FootprintVendorHttpClient,
        incode_session_id: IncodeSessionId,
    ) -> Result<(), IncodeError> {
        let result = self
            .client_adapter
            .onboarding_start(footprint_http_client, None, Some(incode_session_id))
            .await?;
        let parsed = IncodeAPIResult::<OnboardingStartResponse>::try_from(result)?.into_success()?;

        self.client_adapter.update_header_with_token(parsed.token)
    }
}

fn url_path_for_document_side(config: &AddDocumentRequest) -> String {
    // Not all documents have backs
    let front_only = match config.document_type {
        IdDocKind::IdCard => false,
        IdDocKind::DriverLicense => false,
        IdDocKind::Passport => true,
    };

    match config.side {
        DocumentSide::Front => {
            format!("omni/add/front-id/v2?onlyFront={front_only}")
        }
        DocumentSide::Back => format!("omni/add/back-id/v2?retry={}", config.back_is_retry),
    }
}

pub struct AddDocumentRequest {
    pub side: DocumentSide,
    pub image: PiiString,
    pub back_is_retry: bool,
    pub document_type: IdDocKind,
}

#[cfg(test)]
mod tests {
    use newtypes::{vendor_credentials::IncodeCredentials, IdDocKind, IncodeConfigurationId, PiiString};

    use crate::{
        footprint_http_client::FootprintVendorHttpClient,
        incode::{
            request::DocumentSide,
            response::{AddSideResponse, FetchScoresResponse, OnboardingStartResponse, ProcessIdResponse},
            IncodeAPIResult,
        },
        tests::fixtures::images::load_image_and_encode_as_b64,
    };

    use super::{AddDocumentRequest, AuthenticatedIncodeClientAdapter, IncodeClientAdapter};

    fn load_client() -> IncodeClientAdapter {
        let creds = IncodeCredentials {
            api_key: PiiString::from(dotenv::var("INCODE_API_KEY").unwrap()),
            client_id: PiiString::from(dotenv::var("INCODE_CLIENT_ID").unwrap()),
        };

        IncodeClientAdapter::new(false, creds).expect("couldn't load incode client")
    }
    #[ignore]
    #[tokio::test]
    async fn test_document_upload_e2e() {
        let client = load_client();
        let fp_client = FootprintVendorHttpClient::new().unwrap();
        // Start the session
        let config = IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string());
        let res = client
            .onboarding_start(&fp_client, Some(config), None)
            .await
            .unwrap();
        let parsed = IncodeAPIResult::<OnboardingStartResponse>::try_from(res)
            .unwrap()
            .into_success()
            .unwrap();

        // Use token we got from omni/start to authenticate future requests
        let authenticated_client = AuthenticatedIncodeClientAdapter::new(client, parsed.token).unwrap();
        let front = AddDocumentRequest {
            side: DocumentSide::Front,
            image: load_image_and_encode_as_b64("fake_incode_front.jpg").0.into(),
            back_is_retry: false,
            document_type: IdDocKind::DriverLicense,
        };
        let back = AddDocumentRequest {
            side: DocumentSide::Back,
            image: load_image_and_encode_as_b64("fake_incode_back.jpg").0.into(),
            back_is_retry: false,
            document_type: IdDocKind::DriverLicense,
        };

        //
        // Add document sides
        //
        let raw_front_add_side_res = authenticated_client
            .add_document(&fp_client, front)
            .await
            .expect("add side failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::try_from(raw_front_add_side_res)
            .unwrap()
            .into_success()
            .unwrap();

        let raw_back_add_side_res = authenticated_client
            .add_document(&fp_client, back)
            .await
            .expect("add side failed");
        // check we can deser
        IncodeAPIResult::<AddSideResponse>::try_from(raw_back_add_side_res)
            .unwrap()
            .into_success()
            .unwrap();

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
        assert!(scores.id_validation.is_some())
    }
}
