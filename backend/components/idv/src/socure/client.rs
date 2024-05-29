use super::{
    decode_response,
    requirements,
};
use crate::socure::conversion::SocureRequest;
use crate::socure::SocureReqwestError;
use newtypes::{
    IdvData,
    PiiString,
};
use reqwest::header;
use std::time::Duration;
use tokio_retry::strategy::{
    jitter,
    ExponentialBackoff,
};
use tokio_retry::Retry;

#[derive(Clone)]
pub struct SocureClient {
    client: reqwest::Client,
    idplus_url: String,
    reason_code_url: String,
}

impl std::fmt::Debug for SocureClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("socure")
    }
}

impl SocureClient {
    pub fn new(sdk_key: String, sandbox: bool) -> Result<Self, crate::socure::SocureReqwestError> {
        let idplus_url = if sandbox {
            "https://sandbox.socure.com/api/3.0/EmailAuthScore"
        } else {
            "https://service.socure.com/api/3.0/EmailAuthScore"
        };
        let reason_code_url = "https://service.socure.com/api/3.0/reasoncodes";
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

        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(45))
            .default_headers(headers)
            .build()?;
        Ok(Self {
            client,
            idplus_url: idplus_url.to_string(),
            reason_code_url: reason_code_url.to_string(),
        })
    }

    // Makes call to Socure's ID+ endpoint: https://developer.socure.com/reference#tag/ID+
    #[tracing::instrument(skip_all)]
    pub async fn idplus(
        &self,
        idv_data: IdvData,
        device_session_id: Option<String>,
        ip_address: Option<PiiString>,
    ) -> Result<serde_json::Value, crate::socure::Error> {
        // TODO: For now this just tries 1 time. We need to differentiate retriable errors from other errors
        //  and match on that and then enable this to retry multiple times
        let retry_strategy = ExponentialBackoff::from_millis(10).map(jitter).take(0);
        let result = Retry::spawn(retry_strategy, || {
            self.attempt_idplus(idv_data.clone(), device_session_id.clone(), ip_address.clone())
        })
        .await?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    async fn attempt_idplus(
        &self,
        idv_data: IdvData,
        device_session_id: Option<String>,
        ip_address: Option<PiiString>,
    ) -> Result<serde_json::Value, crate::socure::Error> {
        let present_data_kinds = IdvData::present_data_attributes(&idv_data);
        let modules = requirements::modules_for_idplus_request(&present_data_kinds, &device_session_id)
            .iter()
            .map(|m| m.to_string())
            .collect::<Vec<String>>();

        let req = SocureRequest::new(modules, idv_data, device_session_id, ip_address)?;
        tracing::info!(req = format!("{:?}", req), "SocureClient req");
        let response = self
            .client
            .post(self.idplus_url.to_string())
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

    #[tracing::instrument(skip_all)]
    pub async fn reason_code(&self) -> Result<serde_json::Value, crate::socure::Error> {
        tracing::info!("SocureClient reason_code");
        let response = self
            .client
            .get(self.reason_code_url.clone())
            .timeout(Duration::from_secs(3))
            .send()
            .await?;

        let json_response = decode_response::<serde_json::Value>(response).await;

        match json_response {
            Ok(_) => {
                tracing::info!("SocureClient reason_code success");
            }
            Err(ref err) => {
                tracing::warn!(error = format!("{:?}", err), "SocureClient reason_code error");
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
            phone_number: Some(PiiString::from("1234567891")),
            ..Default::default()
        };

        let device_session_id = Some(String::from("placeholder"));
        let ip_address = Some(PiiString::from("1.2.3.4"));

        let res = socure_client
            .idplus(idv_data, device_session_id, ip_address)
            .await
            .unwrap();
        tracing::info!(res = format!("{:?}", res), "res");
        let parsed_res = crate::socure::parse_response(res).unwrap();
        tracing::info!(parsed_res = format!("{:?}", parsed_res), "parsed_res");
    }
}
