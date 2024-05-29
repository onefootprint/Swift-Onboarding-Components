use async_trait::async_trait;
use macros::HiddenDebug;
use newtypes::PiiString;
use reqwest::Method;
use serde::Serialize;
use std::fmt::Display;
use std::time::Duration;
use tokio_retry::strategy::{
    jitter,
    ExponentialBackoff,
};
use tokio_retry::Retry;
use types::account::CreateAccountRequest;
mod error;
pub mod types;

pub use self::error::Error;
pub use self::types::cip::*;

pub type AlpacaResult<T> = Result<T, error::Error>;

#[derive(HiddenDebug, Clone)]
pub struct AlpacaCipClient {
    api_key: PiiString,
    api_secret: PiiString,
    host: String,
    client: reqwest::Client,
}

impl AlpacaCipClient {
    pub fn new(api_key: PiiString, api_secret: PiiString, host: &str) -> AlpacaResult<Self> {
        let client = reqwest::Client::builder().build()?;

        Ok(Self {
            api_key,
            api_secret,
            host: host.into(),
            client,
        })
    }

    fn url<P: Display>(&self, path: P) -> String {
        format!("https://{}{}", &self.host, path)
    }

    async fn make_request_with_retry<S: Serialize + Clone, P: Display + Clone>(
        &self,
        method: Method,
        path: P,
        json_body: &S,
    ) -> AlpacaResult<reqwest::Response> {
        let retry_strategy = ExponentialBackoff::from_millis(10)
        .map(jitter) // add jitter
        .take(3); // limit to 3 retries

        let path2 = path.clone();
        let result = Retry::spawn(retry_strategy, move || {
            self.make_request(method.clone(), path.clone(), json_body)
        })
        .await
        .map_err(|err| {
            if let Error::Reqwest(e) = err {
                // tenant provides hostname in the alpaca request, so connection/dns errors are probably from
                // their side
                if e.is_connect() {
                    Error::ConnectionError(path2.to_string())
                } else {
                    Error::Reqwest(e)
                }
            } else {
                err
            }
        })?;

        Ok(result)
    }

    async fn make_request<S: Serialize + Clone, P: Display>(
        &self,
        method: Method,
        path: P,
        json_body: &S,
    ) -> AlpacaResult<reqwest::Response> {
        let url = self.url(path);

        let request: reqwest::Request = self
            .client
            .request(method, url)
            .timeout(Duration::from_secs(4))
            .basic_auth(
                self.api_key.leak_to_string(),
                Some(self.api_secret.leak_to_string()),
            )
            .header(reqwest::header::CONTENT_TYPE, "application/json")
            .json(json_body)
            .build()?;

        Ok(self.client.execute(request).await?)
    }
}

#[async_trait]
pub trait AlpacaCip {
    /// POST /v1/accounts/{account_id}/cip
    /// Returns the direct response from alpaca
    async fn send_cip(&self, account_id: String, request: CipRequest) -> AlpacaResult<reqwest::Response>;

    /// POST /v1/accounts
    /// Returns the direct response from alpaca
    async fn create_account(&self, request: CreateAccountRequest) -> AlpacaResult<reqwest::Response>;
}

#[async_trait]
impl AlpacaCip for AlpacaCipClient {
    async fn send_cip(&self, account_id: String, request: CipRequest) -> AlpacaResult<reqwest::Response> {
        let path = format!("/v1/accounts/{account_id}/cip");
        let response = self.make_request_with_retry(Method::POST, path, &request).await?;
        Ok(response)
    }

    async fn create_account(&self, request: CreateAccountRequest) -> AlpacaResult<reqwest::Response> {
        let path = "/v1/accounts";
        let response = self.make_request_with_retry(Method::POST, path, &request).await?;
        Ok(response)
    }
}
