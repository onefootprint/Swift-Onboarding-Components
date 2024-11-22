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
    use crate::sentilink::application_risk::request::AppRiskMetadata;
    use crate::sentilink::application_risk::response::ApplicationRiskResponse;
    use crate::sentilink::SentilinkApplicationRiskRequest;
    use newtypes::sentilink::SentilinkProduct;
    use newtypes::FpId;
    use newtypes::IdvData;
    use newtypes::ObConfigurationId;
    use newtypes::WorkflowId;
    use std::str::FromStr;
    use strum::IntoEnumIterator;

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

        let request = test_application_request();

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

    fn test_application_request() -> ApplicationRiskRequest {
        let idv_data = IdvData {
            first_name: Some("John".into()),
            last_name: Some("Doe".into()),
            dob: Some("1990-01-01".into()),
            ssn9: Some("123456789".into()),
            address_line1: Some("123 Main Street".into()),
            address_line2: Some("Apt 4B".into()),
            country: Some("US".into()),
            city: Some("Pleasantville".into()),
            state: Some("CA".into()),
            zip: Some("32407".into()),
            phone_number: Some("2223338999".into()),
            email: Some("testuser@gmail.com".into()),
            ..Default::default() // In case there are other fields we don't need to set
        };
        let meta = AppRiskMetadata {
            ob_configuration_id: Some(ObConfigurationId::from_str("obc_12345").unwrap()),
        };

        let req = SentilinkApplicationRiskRequest {
            idv_data,
            credentials: get_credentials(),
            products: SentilinkProduct::iter().collect(),
            workflow_id: WorkflowId::from_str("wf_12345").unwrap(),
            ip_address: None,
            fp_id: FpId::from_str("fp_12345").unwrap(),
            metadata: Some(meta),
        };

        // This is to make sure that we have some test coverage for creating the request
        // and that sentilink accepts it in the ignored test above.
        ApplicationRiskRequest::try_from(req).unwrap()
    }
}
