use super::response;
use super::Error;
use super::MiddeskCreateBusinessRequest;
use super::MiddeskGetBusinessRequest;
use super::MiddeskReqwestError;
use crate::middesk::request::business::BusinessRequest;
use newtypes::vendor_credentials::MiddeskCredentials;
use reqwest::header;
use reqwest::Method;
use reqwest::RequestBuilder;
use reqwest::Url;
use std::time::Duration;

#[derive(Clone)]
pub struct MiddeskClient {
    client: reqwest::Client,
    base_url: String,
}

impl MiddeskClient {
    pub fn new(base_url: String) -> Result<Self, crate::Error> {
        let mut headers = header::HeaderMap::new();

        headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );

        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(45))
            .default_headers(headers)
            .build()
            .map_err(MiddeskReqwestError::from)
            .map_err(Error::from)?;
        Ok(Self { client, base_url })
    }

    fn request(
        &self,
        credentials: &MiddeskCredentials,
        method: Method,
        url: Url,
    ) -> Result<RequestBuilder, Error> {
        Ok(self.client.request(method, url).header(
            "Authorization",
            header::HeaderValue::from_str(
                format!("Bearer {}", credentials.api_key.leak_to_string()).as_str(),
            )
            .map_err(MiddeskReqwestError::from)?,
        ))
    }

    #[allow(unused)]
    pub async fn post_business(&self, req: MiddeskCreateBusinessRequest) -> Result<serde_json::Value, Error> {
        let MiddeskCreateBusinessRequest {
            business_data,
            credentials,
            tenant_id,
        } = req;
        let req = BusinessRequest::from((business_data, tenant_id.to_string()));
        let url = Url::parse(self.base_url.as_str())
            .map_err(Error::RequestUrlError)?
            .join("businesses")
            .map_err(Error::RequestUrlError)?;

        tracing::info!(req=?req, url=?url, "MiddeskClient::post_business");

        let response = self
            .request(&credentials, Method::POST, url)?
            .json(&req)
            .timeout(Duration::from_secs(5))
            .send()
            .await
            .map_err(MiddeskReqwestError::from)?;

        response::decode_response::<serde_json::Value>(response).await
    }

    #[allow(unused)]
    pub async fn get_business(&self, req: MiddeskGetBusinessRequest) -> Result<serde_json::Value, Error> {
        let MiddeskGetBusinessRequest {
            business_id,
            credentials,
        } = req;
        let url = Url::parse(self.base_url.as_str())
            .map_err(Error::RequestUrlError)?
            .join(&format!("businesses/{}", business_id))
            .map_err(Error::RequestUrlError)?;

        tracing::info!(url=?url, "MiddeskClient::get_business");

        let response = self
            .request(&credentials, Method::GET, url)?
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
    use newtypes::BoData;
    use newtypes::BusinessDataForRequest;
    use newtypes::BusinessDataFromVault;
    use newtypes::EinOnly;
    use newtypes::PiiString;
    use newtypes::TenantId;
    use std::str::FromStr;

    #[ignore]
    #[tokio::test]
    async fn test_client() {
        let api_key = PiiString::from(dotenv::var("MIDDESK_API_KEY").unwrap());
        let credentials = MiddeskCredentials { api_key };
        let base_url = dotenv::var("MIDDESK_BASE_URL").unwrap();

        let client = MiddeskClient::new(base_url).unwrap();

        let business_data = BusinessDataFromVault {
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

        let res = client
            .post_business(MiddeskCreateBusinessRequest {
                business_data: BusinessDataForRequest::try_from((business_data, EinOnly(false))).unwrap(),
                credentials,
                tenant_id: TenantId::from_str("t_123").unwrap(),
            })
            .await
            .unwrap();
        let json_res = String::from_utf8(serde_json::to_vec_pretty(&res).unwrap()).unwrap();
        println!("json_res: {}", json_res);
        let parsed_res = response::parse_response(res).unwrap();
        assert_eq!(parsed_res.object, Some("business".to_owned()));
        assert_eq!(parsed_res.status, Some("open".to_owned()))
    }
}
