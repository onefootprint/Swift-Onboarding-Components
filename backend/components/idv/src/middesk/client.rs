use newtypes::{BusinessData, PiiString};
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
    pub fn new(api_key: PiiString, base_url: String) -> Result<Self, Error> {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(format!("Bearer {}", api_key.leak_to_string()).as_str())
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
        Ok(Self { client, base_url })
    }

    #[allow(unused)]
    pub async fn post_business(&self, business_data: BusinessData) -> Result<serde_json::Value, Error> {
        let req = BusinessRequest::from(business_data);
        let url = Url::parse(self.base_url.as_str())
            .map_err(Error::RequestUrlError)?
            .join("businesses")
            .map_err(Error::RequestUrlError)?;

        tracing::info!(req=?req, url=?url, "MiddeskClient::post_business");

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

    #[allow(unused)]
    pub async fn get_business(&self, business_id: String) -> Result<serde_json::Value, Error> {
        let url = Url::parse(self.base_url.as_str())
            .map_err(Error::RequestUrlError)?
            .join(&format!("businesses/{}", business_id))
            .map_err(Error::RequestUrlError)?;

        tracing::info!(url=?url, "MiddeskClient::get_business");

        let response = self
            .client
            .get(url)
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
        let api_key = PiiString::from(dotenv::var("MIDDESK_API_KEY").unwrap());
        let base_url = dotenv::var("MIDDESK_BASE_URL").unwrap();

        let client = MiddeskClient::new(api_key, base_url).unwrap();

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
