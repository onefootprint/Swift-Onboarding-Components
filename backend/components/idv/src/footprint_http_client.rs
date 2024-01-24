use std::time::Duration;

use chrono::Utc;
use reqwest_middleware::{ClientBuilder, ClientWithMiddleware, Middleware};
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use reqwest_tracing::TracingMiddleware;

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
            .with(TracingMiddleware::default())
            .with(SoftTimeoutMiddleware)
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

/// For now, just log when a timeout is reached. One day, we will actually enforce a timeout
struct SoftTimeoutMiddleware;

#[async_trait::async_trait]
impl Middleware for SoftTimeoutMiddleware {
    async fn handle(
        &self,
        req: reqwest::Request,
        extensions: &mut task_local_extensions::Extensions,
        next: reqwest_middleware::Next<'_>,
    ) -> reqwest_middleware::Result<reqwest::Response> {
        let start = Utc::now();
        let res = next.run(req, extensions).await;
        let elapsed = Utc::now() - start;
        if elapsed.num_seconds() > 20 {
            tracing::warn!(num_seconds=%elapsed.num_seconds(), "Vendor request soft timeout exceeded");
        }
        res
    }
}
