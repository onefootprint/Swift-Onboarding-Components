use chrono::Utc;
use reqwest_middleware::ClientBuilder;
use reqwest_middleware::ClientWithMiddleware;
use reqwest_middleware::Middleware;
use reqwest_retry::policies::ExponentialBackoff;
use reqwest_retry::RetryTransientMiddleware;
use reqwest_tracing::ReqwestOtelSpanBackend;
use reqwest_tracing::TracingMiddleware;
use std::time::Duration;

#[derive(Clone)]
pub struct FootprintVendorHttpClient {
    pub client: ClientWithMiddleware,
}

#[derive(Default)]
pub struct FpVendorClientArgs {
    pub num_retries: Option<u32>,
}

impl FootprintVendorHttpClient {
    pub fn new(args: FpVendorClientArgs) -> Result<Self, crate::Error> {
        let FpVendorClientArgs { num_retries } = args;
        let num_retries = num_retries.unwrap_or(2);
        let retry_policy = ExponentialBackoff::builder()
            .retry_bounds(Duration::from_millis(200), Duration::from_secs(3))
            .base(1)
            .build_with_max_retries(num_retries);

        // Note: the order of the middlewares matters
        let client = ClientBuilder::new(reqwest::Client::new())
            // Will only retry if:
            // * The status was 5XX (server error)
            // * The status was 408 (request timeout) or 429 (too many requests)
            .with(RetryTransientMiddleware::new_with_policy(retry_policy))
            // Log when a soft timeout has been reached
            .with(SoftTimeoutMiddleware)
            // Trace each individual API request
            .with(TracingMiddleware::<OtelPathSpanName>::new())
            .build();

        Ok(Self { client })
    }

    pub fn new_for_incode() -> Self {
        let num_retries = 0;
        let retry_policy = ExponentialBackoff::builder()
            .retry_bounds(Duration::from_millis(200), Duration::from_secs(3))
            .base(1)
            // .build_with_total_retry_duration_and_max_retries(Duration::from_secs(15))
            .build_with_max_retries(num_retries);

        // Note: the order of the middlewares matters
        let client = ClientBuilder::new(reqwest::Client::new())
            // Will only retry if:
            // * The status was 5XX (server error)
            // * The status was 408 (request timeout) or 429 (too many requests)
            .with(RetryTransientMiddleware::new_with_policy(retry_policy))
            // Log when a soft timeout has been reached
            .with(SoftTimeoutMiddleware)
            // Trace each individual API request
            .with(TracingMiddleware::<OtelPathSpanName>::new())
            .build();

        Self { client }
    }
}

impl std::ops::Deref for FootprintVendorHttpClient {
    type Target = ClientWithMiddleware;

    fn deref(&self) -> &Self::Target {
        &self.client
    }
}

/// An implementation of ReqwestOtelSpanBackend that uses the request method and request URL as
/// the span name.
struct OtelPathSpanName;

impl ReqwestOtelSpanBackend for OtelPathSpanName {
    fn on_request_start(req: &reqwest::Request, _: &mut task_local_extensions::Extensions) -> tracing::Span {
        let name = format!(
            "{} {} {}",
            req.method(),
            req.url().host_str().unwrap_or("-"),
            req.url().path()
        );
        use reqwest_tracing::reqwest_otel_span;
        reqwest_otel_span!(name = name, req)
    }

    fn on_request_end(
        span: &tracing::Span,
        outcome: &reqwest_middleware::Result<reqwest::Response>,
        _: &mut task_local_extensions::Extensions,
    ) {
        reqwest_tracing::default_on_request_end(span, outcome)
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
