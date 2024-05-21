use newtypes::{vendor_credentials::SambaSafetyCredentials, PiiString};
use reqwest::header;

use crate::footprint_http_client::FootprintVendorHttpClient;

use super::{error::Error as SambaSafetyError, response::auth::AuthenticationResponse};

#[derive(Clone)]
struct SambaHeaders(header::HeaderMap);
#[derive(Clone)]
#[allow(unused)]
pub(crate) struct SambaAuthToken(PiiString);

#[derive(Clone)]
pub struct SambaSafetyClientAdapter {
    base_url: String,
    headers: SambaHeaders,
    auth_username: PiiString,
    auth_password: PiiString,
}

impl SambaSafetyClientAdapter {
    pub fn new(credentials: SambaSafetyCredentials) -> Result<Self, SambaSafetyError> {
        let mut headers = header::HeaderMap::new();
        let base_url = credentials.base_url.leak_to_string();
        headers.insert(
            "x-api-key",
            header::HeaderValue::from_str(credentials.api_key.leak())?,
        );

        Ok(Self {
            base_url,
            headers: SambaHeaders(headers),
            auth_username: credentials.auth_username,
            auth_password: credentials.auth_password,
        })
    }

    #[tracing::instrument(skip_all)]
    pub async fn get_authenticated_client(
        self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<AuthenticatedSambaSafetyClientAdapter, SambaSafetyError> {
        let mut params = std::collections::HashMap::new();
        params.insert("grant_type", "client_credentials");
        params.insert("scope", "API");
        let url = self.api_url("oauth2/v1/token")?;

        let response = footprint_http_client
            .post(url)
            .basic_auth(
                self.auth_username.clone().leak(),
                Some(self.auth_password.clone().leak()),
            )
            .headers(self.headers.0.clone())
            .form(&params)
            .send()
            .await
            .map_err(|err| SambaSafetyError::SendError(err.to_string()))?;

        let (cl, http_status) = (response.content_length(), response.status());
        let parsed_response = if http_status.is_success() {
            let json = response.json::<serde_json::Value>().await?;
            let response: AuthenticationResponse = serde_json::from_value(json)?;
            Ok(response)
        } else {
            tracing::info!(http_status=%http_status, content_length=?cl, service=?"token", "samba error response");
            Err(SambaSafetyError::HttpError(
                http_status.as_u16(),
                "AuthTokenRequest".into(),
            ))
        }?;

        let authenticated_client =
            AuthenticatedSambaSafetyClientAdapter::new(self, parsed_response.access_token);

        Ok(authenticated_client)
    }
}

impl SambaSafetyClientAdapter {
    // TODO: auto-fix this
    fn api_url(&self, path: &str) -> Result<String, SambaSafetyError> {
        if path.starts_with('/') {
            return Err(SambaSafetyError::SendError(
                "path suffix should not start with leading /".into(),
            ));
        }
        Ok(format!("{}/{}", self.base_url, path))
    }
}

#[derive(Clone)]
/// A struct that represents a client that has an Authorization token to be reused across API calls
pub struct AuthenticatedSambaSafetyClientAdapter {
    #[allow(unused)]
    client_adapter: SambaSafetyClientAdapter,
    #[allow(unused)]
    auth_token: PiiString,
}

impl AuthenticatedSambaSafetyClientAdapter {
    pub(crate) fn new(client_adapter: SambaSafetyClientAdapter, auth_token: PiiString) -> Self {
        Self {
            client_adapter,
            auth_token,
        }
    }
}


#[cfg(test)]
mod tests {
    use crate::footprint_http_client::FpVendorClientArgs;

    use super::*;

    async fn get_authed_client() -> AuthenticatedSambaSafetyClientAdapter {
        let api_key = PiiString::from(dotenv::var("SAMBA_API_KEY").unwrap());
        let auth_username = PiiString::from(dotenv::var("SAMBA_AUTH_USERNAME").unwrap());
        let auth_password = PiiString::from(dotenv::var("SAMBA_AUTH_PASSWORD").unwrap());
        let creds = SambaSafetyCredentials {
            api_key,
            base_url: "https://api-demo.sambasafety.io".into(),
            auth_username,
            auth_password,
        };
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let client_adapter = SambaSafetyClientAdapter::new(creds).unwrap();
        client_adapter.get_authenticated_client(&fp_client).await.unwrap()
    }

    #[ignore]
    #[tokio::test]
    async fn test_get_authed_client() {
        get_authed_client().await;
    }
}
