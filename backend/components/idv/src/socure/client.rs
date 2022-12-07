use crate::socure::conversion::SocureRequest;
use crate::socure::SocureReqwestError;
use newtypes::IdvData;
use reqwest::header;

use std::time::Duration;
use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::Retry;

use super::decode_response;

#[derive(Clone)]
pub struct SocureClient {
    client: reqwest::Client,
    url: String,
}

impl std::fmt::Debug for SocureClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("socure")
    }
}

impl SocureClient {
    pub fn new(sdk_key: String, sandbox: bool) -> Result<Self, crate::socure::SocureReqwestError> {
        let url = if sandbox {
            "https://sandbox.socure.com/api/3.0/EmailAuthScore"
        } else {
            "https://socure.com/api/3.0/EmailAuthScore"
        };
        let mut headers = header::HeaderMap::new();
        let header_val = format!("SocureApiKey {}", sdk_key);
        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(header_val.as_str())?,
        );
        headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );

        let client = reqwest::Client::builder().default_headers(headers).build()?;
        Ok(Self {
            client,
            url: url.to_string(),
        })
    }

    pub async fn verify_kyc(
        self,
        idv_data: IdvData,
    ) -> Result<serde_json::Value, crate::socure::SocureError> {
        // TODO: For now this just tries 1 time. We need to differentiate retriable errors from other errors
        //  and match on that and then enable this to retry multiple times
        let retry_strategy = ExponentialBackoff::from_millis(10).map(jitter).take(0);
        let result = Retry::spawn(retry_strategy, || self.attempt_verify_kyc(idv_data.clone())).await?;

        Ok(result)
    }

    async fn attempt_verify_kyc(
        &self,
        idv_data: IdvData,
    ) -> Result<serde_json::Value, crate::socure::SocureError> {
        // TODO: what modules are we using
        let req = SocureRequest::new(vec!["kyc".to_string()], idv_data)?;

        let response = self
            .client
            .post(self.url.to_string())
            .json(&req)
            .timeout(Duration::from_secs(5))
            .send()
            .await
            .map_err(|err| SocureReqwestError::ReqwestSendError(err.to_string()))?;

        let json_response = decode_response::<serde_json::Value>(response).await;

        match json_response {
            Ok(_) => {
                tracing::info!("SocureClient success");
            }
            Err(ref err) => {
                tracing::warn!(error = format!("{:?}", err), "SocureClient error");
                // TODO: write grafana/es alerts off of these
            }
        }
        json_response
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use dotenv;

    use newtypes::PiiString;
    use tracing_test::traced_test;

    #[ignore]
    #[traced_test]
    #[tokio::test]
    async fn test_client() {
        let sdk_key = dotenv::var("SOCURE_SANDBOX_API_KEY").unwrap();
        let socure_client = SocureClient::new(sdk_key, true).unwrap();

        let idv_data = IdvData {
            first_name: Some(PiiString::from("Dwayne")),
            last_name: Some(PiiString::from("Denver")),
            address_line1: None,
            address_line2: None,
            city: None,
            state: None,
            country: Some(PiiString::from("US")),
            zip: None,
            ssn4: None,
            ssn9: None,
            dob: Some(PiiString::from("1975-04-02")),
            email: None,
            phone_number: None,
        };

        let res = socure_client.verify_kyc(idv_data).await.unwrap();
        println!("res: {:?}", res);
        let parsed_res = crate::socure::parse_response(res).unwrap();
        println!("parsed_res: {:?}", parsed_res);
    }
}
