use reqwest_middleware::ClientWithMiddleware;
use reqwest_tracing::TracingMiddleware;
use rpc::{EnclavePayload, RpcRequest};
use std::time::Duration;

#[derive(Clone, Debug)]
pub struct ProxyHttpClient {
    endpoint: String,
    client: ClientWithMiddleware,
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
        let reqwest_client = reqwest::Client::builder()
            // Some requests can be latent, like a batch decrypt in vault proxy. We might want
            // different timeouts for different use cases
            .timeout(Duration::from_secs(5))
            .build()?;
        let client = reqwest_middleware::ClientBuilder::new(reqwest_client)
            .with(TracingMiddleware::default())
            .build();

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

        let make_request = || {
            self.client
                .post(&url)
                .bearer_auth(&self.bearer_token)
                .json(&payload_request)
                .send()
        };
        let mut response = make_request().await;

        while match &response {
            Ok(response) if response.status().as_u16() >= 500 && retries_left > 0 => true,
            Err(reqwest_middleware::Error::Reqwest(e)) if e.is_timeout() && retries_left > 0 => true,
            Ok(_) | Err(_) => false,
        } {
            response = make_request().await;
            retries_left -= 1;
        }

        let response: ProxyPayloadResponse = response?.json().await?;
        Ok(response.response)
    }
}
