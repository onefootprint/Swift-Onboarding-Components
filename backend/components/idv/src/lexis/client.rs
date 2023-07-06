use crate::lexis::request::LexisRequest;
use crate::lexis::ReqwestError;
use newtypes::IdvData;
use reqwest::header;

use std::time::Duration;
use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::Retry;

use super::decode_response;

#[derive(Clone)]
pub struct LexisClient {
    client: reqwest::Client,
    url: String,
}

impl LexisClient {
    pub fn new(user_id: String, password: String) -> Result<Self, crate::lexis::ReqwestError> {
        let url = "https://wsonline.seisint.com/WsIdentity/FlexID?ver_=2.99";
        let mut headers = header::HeaderMap::new();

        let header_val = format!(
            "Basic {}",
            base64::encode(format!("{}:{}", user_id, password).as_bytes())
        );

        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(header_val.as_str())?,
        );

        let client = reqwest::Client::builder().default_headers(headers).build()?;
        Ok(Self {
            client,
            url: url.to_string(),
        })
    }

    pub async fn flex_id_request(self, idv_data: IdvData) -> Result<serde_json::Value, crate::lexis::Error> {
        // TODO: For now this just tries 1 time. We need to differentiate retriable errors from other errors
        //  and match on that and then enable this to retry multiple times
        let retry_strategy = ExponentialBackoff::from_millis(10).map(jitter).take(0);
        let result = Retry::spawn(retry_strategy, || self.attempt_flex_id_request(idv_data.clone())).await?;

        Ok(result)
    }

    async fn attempt_flex_id_request(
        &self,
        idv_data: IdvData,
    ) -> Result<serde_json::Value, crate::lexis::Error> {
        let req = LexisRequest::new(idv_data)?;
        tracing::info!(req = format!("{:?}", req), "LexisClient req");

        let response = self
            .client
            .post(self.url.to_string())
            .json(&req)
            .timeout(Duration::from_secs(5))
            .send()
            .await
            .map_err(|err| ReqwestError::ReqwestSendError(err.to_string()))?;

        let json_response = decode_response::<serde_json::Value>(response).await;

        match json_response {
            Ok(_) => {
                tracing::info!("LexisClient success");
            }
            Err(ref err) => {
                tracing::warn!(error = format!("{:?}", err), "LexisClient error");
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
        let user_id = dotenv::var("LEXIS_TEST_USER_ID").unwrap();
        let password = dotenv::var("LEXIS_TEST_PASSWORD").unwrap();

        let lexis_client = LexisClient::new(user_id, password).unwrap();

        let idv_data = IdvData {
            first_name: Some(PiiString::from("NICHOLAS")),
            last_name: Some(PiiString::from("BOGGAN")),
            address_line1: Some(PiiString::from("100 east street")),
            address_line2: None,
            city: Some(PiiString::from("anytown")),
            state: Some(PiiString::from("CA")),
            country: Some(PiiString::from("US")),
            zip: Some(PiiString::from("94121")),
            ssn4: None,
            ssn9: Some(PiiString::from("486639975")),
            dob: Some(PiiString::from("1975-04-02")),
            email: None,
            phone_number: Some(PiiString::from("1085551212")),
            ..Default::default()
        };

        let res = lexis_client.flex_id_request(idv_data).await.unwrap();
        println!("res: {:?}", res);
        // let parsed_res = crate::lexis::parse_response(res).unwrap();
        // println!("parsed_res: {:?}", parsed_res);
    }
}
