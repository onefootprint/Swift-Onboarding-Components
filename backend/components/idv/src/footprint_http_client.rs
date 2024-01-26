use std::time::Duration;

use chrono::Utc;
use reqwest_middleware::{ClientBuilder, ClientWithMiddleware, Extension, Middleware};
use reqwest_retry::{policies::ExponentialBackoff, RetryTransientMiddleware};
use reqwest_tracing::{OtelPathNames, TracingMiddleware};

#[derive(Clone)]
pub struct FootprintVendorHttpClient {
    pub client: ClientWithMiddleware,
}

impl FootprintVendorHttpClient {
    pub fn new() -> Result<Self, crate::Error> {
        let retry_policy = ExponentialBackoff::builder()
            .retry_bounds(Duration::from_millis(200), Duration::from_secs(3))
            .base(1)
            .build_with_max_retries(2);

        let trace_url_routes = OtelPathNames::known_paths::<[&str; 0], &str>([])
            .map_err(|_| crate::Error::AssertionError("Couldn't compile OtelPathNames".into()))?;

        // Note: the order of the middlewares matters
        let client = ClientBuilder::new(reqwest::Client::new())
            // Will only retry if:
            // * The status was 5XX (server error)
            // * The status was 408 (request timeout) or 429 (too many requests)
            .with(RetryTransientMiddleware::new_with_policy(retry_policy))
            // Log when a soft timeout has been reached
            .with(SoftTimeoutMiddleware)
            // Specify to TracingMiddleware that we want to log the URL path as the span name
            .with_init(Extension(trace_url_routes))
            // Trace each individual API request
            .with(TracingMiddleware::default())
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
        // TODO eventually implement the hard timeout with `.with_init` using a RequestInitialiser
        if elapsed.num_seconds() > 20 {
            tracing::warn!(num_seconds=%elapsed.num_seconds(), "Vendor request soft timeout exceeded");
        }
        res
    }
}
