use crate::incode::error::Error as IncodeError;
use newtypes::PiiString;
use reqwest::header;

use super::request::OnboardingStartRequest;
const BASE_URL: &str = "https://demo-api.incodesmile.com";
pub(crate) fn api_url(path: &str) -> String {
    format!("{}{}", BASE_URL, path)
}

#[derive(Clone)]
pub struct IncodeClient {
    client: reqwest::Client,
    #[allow(unused)]
    client_id: PiiString,
}

impl IncodeClient {
    pub fn new(api_key: PiiString, client_id: PiiString) -> Result<Self, IncodeError> {
        let mut headers = header::HeaderMap::new();
        headers.insert("api-version", header::HeaderValue::from_str("1.0")?);
        headers.insert("x-api-key", header::HeaderValue::from_str(api_key.leak())?);
        headers.insert("Content-Type", header::HeaderValue::from_str("application/json")?);

        let client = reqwest::Client::builder().default_headers(headers).build()?;

        let res = Self { client, client_id };

        Ok(res)
    }
}

impl IncodeClient {
    pub async fn onboarding_start(
        &self,
        configuration_id: Option<String>,
    ) -> Result<serde_json::Value, IncodeError> {
        let url = api_url("/omni/start");
        let request = OnboardingStartRequest {
            country_code: "ALL".into(),
            // TODO (link OB?)
            external_id: None,
            // TODO (newtype)
            configuration_id,
            // TODO (if we need it)
            interview_id: None,
            language: "en-US".into(),
        };

        let response = self
            .client
            .post(url)
            .json(&request)
            .send()
            .await
            .map_err(|err| IncodeError::SendError(err.to_string()))?;

        Ok(response.json().await?)
    }
}

#[cfg(test)]
mod tests {
    use newtypes::PiiString;

    use crate::incode::response::OnboardingStartResponse;

    use super::IncodeClient;

    fn load_client() -> IncodeClient {
        let api_key = PiiString::from(dotenv::var("INCODE_API_KEY").unwrap());
        let client_id = PiiString::from(dotenv::var("INCODE_CLIENT_ID").unwrap());

        IncodeClient::new(api_key, client_id).expect("couldn't load incode client")
    }
    #[ignore]
    #[tokio::test]
    async fn test_onboarding_start() {
        let client = load_client();

        let res = client.onboarding_start(None).await.unwrap();

        let resp: OnboardingStartResponse = serde_json::from_value(res).unwrap();

        assert!(resp.token.leak().len() > 1)
    }
}
