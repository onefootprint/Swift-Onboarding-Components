use crate::footprint_http_client::FootprintVendorHttpClient;

use super::{error::Error as NeuroError, NeuroApiResult};
use newtypes::{vendor_credentials::NeuroIdCredentials, NeuroIdentityId, PiiString};
use reqwest::header;


pub struct NeuroIdClient {
    site_id: PiiString,
    default_headers: header::HeaderMap,
}

impl NeuroIdClient {
    pub fn new(credentials: NeuroIdCredentials) -> Result<Self, NeuroError> {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "API-KEY",
            header::HeaderValue::from_str(credentials.api_key.leak())?,
        );

        Ok(Self {
            site_id: credentials.site_id,
            default_headers: headers,
        })
    }
}

impl NeuroIdClient {
    pub async fn get_profile(
        &self,
        http_client: &FootprintVendorHttpClient,
        identity_id: &NeuroIdentityId,
    ) -> NeuroApiResult<reqwest::Response> {
        let url = format!(
            "https://api.neuro-id.com/v4.1/sites/{}/profiles/{}",
            self.site_id.leak(),
            identity_id
        );

        http_client
            .client
            .get(url)
            .headers(self.default_headers.clone())
            .send()
            .await
            .map_err(|err| NeuroError::SendError(err.to_string()))
    }
}


#[cfg(test)]
mod tests {
    use crate::footprint_http_client::FpVendorClientArgs;

    use super::*;

    fn example_neuro_creds() -> (NeuroIdCredentials, NeuroIdentityId) {
        // https://neuro-id.readme.io/reference/api-test-cases
        (
            NeuroIdCredentials {
                site_id: "form_neuro300".into(),
                api_key: PiiString::from(dotenv::var("NEURO_TEST_API_KEY").unwrap()),
            },
            NeuroIdentityId::from("example-response-2".to_string()),
        )
    }
    #[ignore]
    #[tokio::test]
    async fn test_neuro_client() {
        let (creds, id) = example_neuro_creds();
        let n_client = NeuroIdClient::new(creds).unwrap();
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let resp = n_client
            .get_profile(&fp_client, &id)
            .await
            .unwrap()
            .json::<serde_json::Value>()
            .await
            .unwrap();
        println!("{}", resp);
    }
}
