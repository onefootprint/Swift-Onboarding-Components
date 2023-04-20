use newtypes::BusinessData;
use reqwest::{header, Url};

use std::time::Duration;

use crate::middesk::request::business::BusinessRequest;

use super::{response, Error, MiddeskReqwestError};

#[derive(Clone)]
pub struct MiddeskClient {
    client: reqwest::Client,
    base_url: String,
}

impl MiddeskClient {
    pub fn new(api_key: String, sandbox: bool) -> Result<Self, Error> {
        let base_url = if sandbox {
            "https://api-sandbox.middesk.com/v1/"
        } else {
            "https://api.middesk.com/v1/"
        };
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(format!("Bearer {}", api_key).as_str())
                .map_err(MiddeskReqwestError::from)?,
        );
        headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );

        let client = reqwest::Client::builder()
            .default_headers(headers)
            .build()
            .map_err(MiddeskReqwestError::from)?;
        Ok(Self {
            client,
            base_url: base_url.to_owned(),
        })
    }

    #[allow(unused)]
    pub async fn post_business(&self, business_data: BusinessData) -> Result<serde_json::Value, Error> {
        let req = BusinessRequest::from(business_data);

        let url = Url::parse(self.base_url.as_str())
            .map_err(Error::RequestUrlError)?
            .join("businesses")
            .map_err(Error::RequestUrlError)?;

        let response = self
            .client
            .post(url)
            .json(&req)
            .timeout(Duration::from_secs(5))
            .send()
            .await
            .map_err(MiddeskReqwestError::from)?;

        response::decode_response::<serde_json::Value>(response).await
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use dotenv;
    use newtypes::{BoData, BusinessData, PiiString};

    #[ignore]
    #[tokio::test]
    async fn test_client() {
        let api_key = dotenv::var("MIDDESK_SANDBOX_API_KEY").unwrap();
        let client = MiddeskClient::new(api_key, true).unwrap();

        let business_data = BusinessData {
            name: Some(PiiString::from("Middesk".to_owned())),
            dba: Some(PiiString::from("mid")),
            website_url: None,
            phone_number: None,
            tin: None,
            address_line1: Some(PiiString::from("2180 Bryant St".to_owned())),
            address_line2: None,
            city: Some(PiiString::from("San Francisco".to_owned())),
            state: Some(PiiString::from("CA".to_owned())),
            zip: Some(PiiString::from("94110".to_owned())),
            business_owners: vec![BoData {
                first_name: PiiString::from("Jane".to_owned()),
                last_name: PiiString::from("Match".to_owned()),
            }],
        };

        let res = client.post_business(business_data).await.unwrap();
        let json_res = String::from_utf8(serde_json::to_vec_pretty(&res).unwrap()).unwrap();
        println!("json_res: {}", json_res);
        let parsed_res = response::parse_response(res).unwrap();
        assert_eq!(parsed_res.object, Some("business".to_owned()));
        assert_eq!(parsed_res.status, Some("open".to_owned()))
    }
}
