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
            header::HeaderValue::from_str(credentials.api_key().leak())?,
        );

        Ok(Self {
            site_id: credentials.site_id(),
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
    use newtypes::vendor_credentials::{NeuroIdApiKeys, NeuroIdSiteId};

    use crate::{
        footprint_http_client::FpVendorClientArgs,
        neuro_id::response::{NeuroApiResponse, Status},
    };

    use super::*;

    fn example_neuro_creds() -> (NeuroIdCredentials, NeuroIdentityId) {
        // https://neuro-id.readme.io/reference/api-test-cases
        (
            NeuroIdCredentials::new(
                NeuroIdApiKeys {
                    key: PiiString::from(dotenv::var("NEUROID_API_KEY").unwrap()),
                    test_key: PiiString::from(dotenv::var("NEUROID_API_KEY_TEST").unwrap()),
                },
                NeuroIdSiteId("form_neuro300".into()),
                true,
            ),
            NeuroIdentityId::from("example-response-2".to_string()),
        )
    }

    #[ignore]
    #[tokio::test]
    async fn test_neuro_client() {
        let (creds, id) = example_neuro_creds();
        let n_client = NeuroIdClient::new(creds).unwrap();
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let response = n_client.get_profile(&fp_client, &id).await.unwrap();

        let resp = NeuroApiResponse::from_response(response)
            .await
            .result
            .into_success()
            .unwrap();

        assert_eq!(resp.status(), Status::Success);

        assert_eq!(resp.signals().len(), 3)
    }
}
