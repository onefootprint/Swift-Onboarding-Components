use rpc::{EnclavePayload, RpcRequest};
use std::time::Duration;

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
            .timeout(Duration::from_secs(1))
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
        self.send_request_inner(request, 2).await
    }

    /// send/recieve response from the proxy
    async fn send_request_inner(
        &self,
        request: RpcRequest,
        mut retries_left: i32,
    ) -> Result<EnclavePayload, crate::Error> {
        let url = self.url("proxy");
        let payload_request = ProxyPayloadRequest {
            request: request.clone(),
        };

        let mut response = self
            .client
            .post(&url)
            .bearer_auth(&self.bearer_token)
            .json(&payload_request)
            .send()
            .await;

        while match &response {
            Ok(response) if response.status().as_u16() >= 500 && retries_left > 0 => true,
            Err(e) if e.is_timeout() && retries_left > 0 => true,
            Ok(_) | Err(_) => false,
        } {
            response = self
                .client
                .post(&url)
                .bearer_auth(&self.bearer_token)
                .json(&payload_request)
                .send()
                .await;
            retries_left -= 1;
        }

        let response: ProxyPayloadResponse = response?.json().await?;
        Ok(response.response)
    }
}
