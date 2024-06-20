use reqwest_middleware::ClientWithMiddleware;
use reqwest_tracing::TracingMiddleware;
use rpc::EnclavePayload;
use rpc::RpcRequest;
use std::error::Error;
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
    #[tracing::instrument(skip_all, fields(request_id=%request.id))]
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
            Err(reqwest_middleware::Error::Reqwest(e))
                if e.is_timeout() || is_incomplete_message_err(e) && retries_left > 0 =>
            {
                true
            }
            Ok(_) | Err(_) => false,
        } {
            response = make_request().await;
            retries_left -= 1;
        }
        match response {
            Err(e) => {
                tracing::error!(e=?e, "Enclave proxy client error");
                Err(crate::Error::from(e))
            }
            Ok(r) if !r.status().is_success() => {
                let status = r.status().as_u16();
                let response = r.text().await?;
                // TODO one day don't log the entire response?
                tracing::error!(resp = %response, "Enclave proxy HTTP error");
                Err(crate::Error::HttpError(status))
            }
            Ok(r) => {
                let response: ProxyPayloadResponse = r.json().await?;
                Ok(response.response)
            }
        }
    }
}

fn is_incomplete_message_err(err: &reqwest::Error) -> bool {
    // Inspired by some reqwest code that checks for inner hyper errors:
    // https://github.com/seanmonstar/reqwest/blob/v0.11.13/src/error.rs#L121
    // These errors occur when the server closes a connection while we are using it and can happen
    // in connection reuse. So, we want to retry them
    let mut source = err.source();

    while let Some(err) = source {
        if let Some(hyper_err) = err.downcast_ref::<hyper::Error>() {
            if hyper_err.is_incomplete_message() {
                return true;
            }
        }

        source = err.source();
    }

    false
}
