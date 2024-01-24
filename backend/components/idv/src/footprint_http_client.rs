use std::time::Duration;

use reqwest_middleware::{ClientBuilder, ClientWithMiddleware};
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};

#[derive(Clone)]
pub struct FootprintVendorHttpClient {
    pub client: ClientWithMiddleware,
}
impl FootprintVendorHttpClient {
    pub fn new() -> Result<Self, reqwest::Error> {
        let retry_policy = ExponentialBackoff::builder()
            .retry_bounds(Duration::from_millis(200), Duration::from_secs(3))
            .base(1)
            .build_with_max_retries(1);
        let client = ClientBuilder::new(reqwest::Client::new())
            // Will only retry if:
            // * The status was 5XX (server error)
            // * The status was 408 (request timeout) or 429 (too many requests)
            .with(RetryTransientMiddleware::new_with_policy(retry_policy))
            .build();

        Ok(Self { client })
    }
}

impl std::ops::Deref for FootprintVendorHttpClient {
    type Target = ClientWithMiddleware;
    fn deref(&self) -> &Self::Target {
        &self.client
    }
}
