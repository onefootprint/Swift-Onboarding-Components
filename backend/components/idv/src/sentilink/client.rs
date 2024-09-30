use super::application_risk::request::ApplicationRiskRequest;
use super::SentilinkResult;
use crate::footprint_http_client::FootprintVendorHttpClient;
use newtypes::vendor_credentials::SentilinkCredentials;
use newtypes::PiiString;
use reqwest::header;
use reqwest::header::HeaderMap;


#[derive(Clone)]
pub struct SentilinkClientAdapter {
    base_url: String,
    auth_username: PiiString,
    auth_password: PiiString,
    default_headers: HeaderMap,
}

impl SentilinkClientAdapter {
    pub fn new(credentials: SentilinkCredentials) -> Self {
        let mut default_headers = header::HeaderMap::new();
        default_headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );

        Self {
            base_url: credentials
                .base_url
                .leak_to_string()
                .trim_end_matches('/')
                .to_string(),
            auth_username: credentials.auth_username,
            auth_password: credentials.auth_password,
            default_headers,
        }
    }

    fn api_url(&self, path: &str) -> String {
        format!("{}/{}", self.base_url, path.to_string().trim_start_matches('/'))
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_application_risk_request(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        // todo: move this to the newtypes adapter
        request: ApplicationRiskRequest,
    ) -> SentilinkResult<reqwest::Response> {
        let url = self.api_url("v2/application");
        let response = footprint_http_client
            .post(url.clone())
            .headers(self.default_headers.clone())
            .basic_auth(self.auth_username.leak(), Some(self.auth_password.leak()))
            .json(&request)
            .send()
            .await?;

        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::footprint_http_client::FpVendorClientArgs;
    use crate::sentilink::application_risk::request::Application;
    use crate::sentilink::application_risk::response::ApplicationRiskResponse;
    use chrono::Utc;
    use newtypes::sentilink::SentilinkProduct;

    fn get_credentials() -> SentilinkCredentials {
        let auth_username = PiiString::from(dotenv::var("SENTILINK_AUTH_USERNAME").unwrap());
        let auth_password = PiiString::from(dotenv::var("SENTILINK_AUTH_PASSWORD").unwrap());
        let base_url = PiiString::from(dotenv::var("SENTILINK_BASE_URL").unwrap());
        SentilinkCredentials {
            base_url,
            auth_username,
            auth_password,
        }
    }

    #[ignore]
    #[tokio::test]
    async fn test_send_request() {
        let credentials = get_credentials();
        let client_adapter = SentilinkClientAdapter::new(credentials);
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let request = ApplicationRiskRequest {
            application: test_application(),
            products: vec![SentilinkProduct::IdTheftScore, SentilinkProduct::SyntheticScore],
        };

        let raw_response = client_adapter
            .send_application_risk_request(&fp_client, request)
            .await
            .unwrap()
            .json()
            .await
            .unwrap();

        let parsed: ApplicationRiskResponse = serde_json::from_value(raw_response).unwrap();

        assert!(parsed.sentilink_synthetic_score.unwrap().score().unwrap().score > 0);
        assert!(parsed.sentilink_id_theft_score.unwrap().score().unwrap().score > 0);
        assert!(!parsed.response_status.is_empty())
    }

    fn test_application() -> Application {
        let raw = serde_json::json!(
        {
            "user_id": "1234567",
            "first_name": "John",
            "user_created": Utc::now(),
            "last_name": "Doe",
            "dob": "1990-01-01",
            "ssn": "123-45-6789",
            "address_line_1": "123 Main Street",
            "city": "Pleasantville",
            "zipcode": "32407",
            "state_code": "CA",
            "country_code": "US",
            "phone":"2223338999",
            "email":"testuser@gmail.com",
            "application_id": "APP-10848",
            "application_created": Utc::now()
        });
        serde_json::from_value(raw).unwrap()
    }
}
