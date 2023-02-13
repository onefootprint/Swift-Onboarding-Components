use crate::experian::error::Error;
use newtypes::PiiString;
use reqwest::header;
use uuid::Uuid;

use super::request::CrossCoreJwtTokenRequest;

// The domain linked to the customer instance.
const REQUIRED_X_USER_DOMAIN_HEADER_VAL: &str = "onefootprint.com";

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub(self) struct CrossCoreAuthTokenCredentials {
    pub(super) username: PiiString,
    pub(super) password: PiiString,
    pub(super) client_id: PiiString,
    pub(super) client_secret: PiiString,
}
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct ExperianAuthClient {
    client: reqwest::Client,
    cross_core_credentials: CrossCoreAuthTokenCredentials,
}

impl ExperianAuthClient {
    pub fn new(
        username: PiiString,
        password: PiiString,
        client_id: PiiString,
        client_secret: PiiString,
    ) -> Result<Self, Error> {
        let mut headers = header::HeaderMap::new();
        // The domain linked to the customer instance.
        headers.insert(
            "X-User-Domain",
            header::HeaderValue::from_str(REQUIRED_X_USER_DOMAIN_HEADER_VAL)?,
        );
        headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );
        let client = reqwest::Client::builder().default_headers(headers).build()?;

        Ok(Self {
            client,
            cross_core_credentials: CrossCoreAuthTokenCredentials {
                username,
                password,
                client_id,
                client_secret,
            },
        })
    }
    #[allow(dead_code)]
    fn to_cross_core_token_req(&self) -> CrossCoreJwtTokenRequest {
        CrossCoreJwtTokenRequest {
            username: self.cross_core_credentials.username.clone(),
            password: self.cross_core_credentials.password.clone(),
            client_id: self.cross_core_credentials.client_id.clone(),
            client_secret: self.cross_core_credentials.client_secret.clone(),
        }
    }

    #[allow(dead_code)]
    pub(crate) async fn send_token_request(&self) -> Result<serde_json::Value, Error> {
        let url = "https://us-api.experian.com/oauth2/experianone/v1/token";
        let req = serde_json::to_string(&self.to_cross_core_token_req()).map_err(Error::from)?;
        // A global unique identifier. When submitting a token request, an X-Correlation-Id must be populated with a globally unique identifier
        // so this is done outside the default headers
        let correlation_id = Uuid::new_v4().to_string();

        let response = self
            .client
            .post(url)
            .body(req)
            .header("X-Correlation-Id", correlation_id.as_str())
            .send()
            .await
            .map_err(|err| Error::SendError(err.to_string()))?
            .json::<serde_json::Value>()
            .await?;

        Ok(response)
    }
}
