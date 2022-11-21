use std::time::Duration;

use rpc::{EnclavePayload, RpcRequest};

#[derive(Clone, Debug)]
pub struct ProxyHttpClient {
    endpoint: String,
    client: reqwest::Client,
    bearer_token: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayloadRequest {
    pub request: RpcRequest,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayloadResponse {
    pub response: EnclavePayload,
}

impl ProxyHttpClient {
    pub fn new(endpoint: &str, proxy_auth_token: &str) -> Result<Self, crate::Error> {
        let client = reqwest::ClientBuilder::new()
            .timeout(Duration::from_secs(4))
            .build()?;

        Ok(Self {
            client,
            endpoint: endpoint.to_string(),
            bearer_token: proxy_auth_token.to_string(),
        })
    }

    fn url(&self, path: &'static str) -> String {
        format!("{}/{}", self.endpoint, path)
    }

    /// check that the proxy is healthy
    pub async fn is_healthy(&self) -> Result<bool, crate::Error> {
        let url = self.url("health");
        let res = self
            .client
            .get(url)
            .bearer_auth(&self.bearer_token)
            .send()
            .await?;
        Ok(res.status().is_success())
    }

    /// send/recieve response from the proxy
    pub async fn send_request(&self, request: RpcRequest) -> Result<EnclavePayload, crate::Error> {
        let url = self.url("proxy");
        let request = ProxyPayloadRequest { request };
        let response: ProxyPayloadResponse = self
            .client
            .post(url)
            .bearer_auth(&self.bearer_token)
            .json(&request)
            .send()
            .await?
            .json()
            .await?;
        Ok(response.response)
    }
}
