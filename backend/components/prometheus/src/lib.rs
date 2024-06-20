//! Adapted from https://github.com/nlopes/actix-web-prom

use actix_web::body::BodySize;
use actix_web::body::EitherBody;
use actix_web::body::MessageBody;
use actix_web::dev::Service;
use actix_web::dev::ServiceRequest;
use actix_web::dev::ServiceResponse;
use actix_web::dev::Transform;
use actix_web::dev::{
    self,
};
use actix_web::http::header::HeaderValue;
use actix_web::http::header::CONTENT_TYPE;
use actix_web::http::Method;
use actix_web::http::StatusCode;
use actix_web::web::Bytes;
use actix_web::Error;
use futures_core::ready;
use pin_project_lite::pin_project;
use prometheus::Encoder;
use prometheus::HistogramOpts;
use prometheus::HistogramVec;
use prometheus::IntCounterVec;
use prometheus::Opts;
use prometheus::Registry;
use prometheus::TextEncoder;
use std::collections::HashMap;
use std::future::ready;
use std::future::Future;
use std::future::Ready;
use std::marker::PhantomData;
use std::pin::Pin;
use std::sync::Arc;
use std::task::Context;
use std::task::Poll;
use std::time::Instant;

#[derive(Debug)]
/// Builder to create new PrometheusMetrics struct.HistogramVec
///
/// It allows setting optional parameters like registry, buckets, etc.
pub struct PrometheusMetricsBuilder {
    namespace: String,
    endpoint: Option<String>,
    const_labels: HashMap<String, String>,
    registry: Registry,
    buckets: Vec<f64>,
}

impl PrometheusMetricsBuilder {
    /// Create new PrometheusMetricsBuilder
    ///
    /// namespace example: "actix"
    pub fn new(namespace: &str) -> Self {
        Self {
            namespace: namespace.into(),
            endpoint: None,
            const_labels: HashMap::new(),
            registry: Registry::new(),
            buckets: prometheus::DEFAULT_BUCKETS.to_vec(),
        }
    }

    /// Set actix web endpoint
    ///
    /// Example: "/metrics"
    pub fn endpoint(mut self, value: &str) -> Self {
        self.endpoint = Some(value.into());
        self
    }

    /// Set histogram buckets
    pub fn buckets(mut self, value: &[f64]) -> Self {
        self.buckets = value.to_vec();
        self
    }

    /// Set labels to add on every metrics
    pub fn const_labels(mut self, value: HashMap<String, String>) -> Self {
        self.const_labels = value;
        self
    }

    /// Set registry
    ///
    /// By default one is set and is internal to PrometheusMetrics
    pub fn registry(mut self, value: Registry) -> Self {
        self.registry = value;
        self
    }

    /// Instantiate PrometheusMetrics struct
    pub fn build(self) -> Result<PrometheusMetrics, Box<dyn std::error::Error + Send + Sync>> {
        let http_requests_total_opts = Opts::new("http_requests_total", "Total number of HTTP requests")
            .namespace(&self.namespace)
            .const_labels(self.const_labels.clone());

        let http_requests_total =
            IntCounterVec::new(http_requests_total_opts, &["endpoint", "method", "status"])?;

        let http_requests_duration_seconds_opts = HistogramOpts::new(
            "http_requests_duration_seconds",
            "HTTP request duration in seconds for all requests",
        )
        .namespace(&self.namespace)
        .buckets(self.buckets.to_vec())
        .const_labels(self.const_labels.clone());

        let http_requests_duration_seconds = HistogramVec::new(
            http_requests_duration_seconds_opts,
            &["endpoint", "method", "status"],
        )?;

        self.registry.register(Box::new(http_requests_total.clone()))?;
        self.registry
            .register(Box::new(http_requests_duration_seconds.clone()))?;

        Ok(PrometheusMetrics {
            http_requests_total,
            _http_requests_duration_seconds: http_requests_duration_seconds,
            registry: self.registry,
            _namespace: self.namespace,
            endpoint: self.endpoint,
            _const_labels: self.const_labels,
        })
    }
}

#[derive(Clone)]
#[must_use = "must be set up as middleware for actix-web"]
/// By default two metrics are tracked (this assumes the namespace `actix_web_prom`):
///
///   - `actix_web_prom_http_requests_total` (labels: endpoint, method, status): the total
///   number of HTTP requests handled by the actix HttpServer.
///
///   - `actix_web_prom_http_requests_duration_seconds` (labels: endpoint, method,
///    status): the request duration for all HTTP requests handled by the actix
///    HttpServer.
pub struct PrometheusMetrics {
    pub(crate) http_requests_total: IntCounterVec,
    pub(crate) _http_requests_duration_seconds: HistogramVec,

    /// exposed registry for custom prometheus metrics
    pub registry: Registry,
    pub(crate) _namespace: String,
    pub(crate) endpoint: Option<String>,
    pub(crate) _const_labels: HashMap<String, String>,
}

impl PrometheusMetrics {
    fn metrics(&self) -> String {
        let mut buffer = vec![];
        TextEncoder::new()
            .encode(&self.registry.gather(), &mut buffer)
            .unwrap();
        String::from_utf8(buffer).unwrap()
    }

    fn matches(&self, path: &str, method: &Method) -> bool {
        if self.endpoint.is_some() {
            self.endpoint.as_ref().unwrap() == path && method == Method::GET
        } else {
            false
        }
    }

    fn update_metrics(&self, path: &str, method: &Method, status: StatusCode, clock: Instant) {
        let method = method.to_string();
        let status = status.as_u16().to_string();

        let elapsed = clock.elapsed();
        let _duration = (elapsed.as_secs() as f64) + f64::from(elapsed.subsec_nanos()) / 1_000_000_000_f64;
        // We don't want to emit histogram metrics on latency here - they're pretty expensive
        // and we get them from otel
        /*
        self._http_requests_duration_seconds
            .with_label_values(&[path, &method, &status])
            .observe(duration);
        */

        self.http_requests_total
            .with_label_values(&[path, &method, &status])
            .inc();
    }
}

impl<S, B> Transform<S, ServiceRequest> for PrometheusMetrics
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
{
    type Error = Error;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;
    type InitError = ();
    type Response = ServiceResponse<EitherBody<StreamLog<B>, StreamLog<String>>>;
    type Transform = PrometheusMetricsMiddleware<S>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(PrometheusMetricsMiddleware {
            service,
            inner: Arc::new(self.clone()),
        }))
    }
}

pin_project! {
    #[doc(hidden)]
    pub struct LoggerResponse<S>
        where
        S: Service<ServiceRequest>,
    {
        #[pin]
        fut: S::Future,
        time: Instant,
        inner: Arc<PrometheusMetrics>,
        _t: PhantomData<()>,
    }
}

impl<S, B> Future for LoggerResponse<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
{
    type Output = Result<ServiceResponse<EitherBody<StreamLog<B>, StreamLog<String>>>, Error>;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let this = self.project();

        let res = match ready!(this.fut.poll(cx)) {
            Ok(res) => res,
            Err(e) => return Poll::Ready(Err(e)),
        };

        let time = *this.time;
        let req = res.request();
        let method = req.method().clone();
        let pattern_or_path = req.match_pattern().unwrap_or_else(|| req.path().to_string());
        let path = req.path().to_string();
        let inner = this.inner.clone();

        Poll::Ready(Ok(res.map_body(move |head, body| {
            // We short circuit the response status and body to serve the endpoint
            // automagically. This way the user does not need to set the middleware *AND*
            // an endpoint to serve middleware results. The user is only required to set
            // the middleware and tell us what the endpoint should be.
            if inner.matches(&path, &method) {
                head.status = StatusCode::OK;
                head.headers.insert(
                    CONTENT_TYPE,
                    HeaderValue::from_static("text/plain; version=0.0.4; charset=utf-8"),
                );

                EitherBody::right(StreamLog {
                    body: inner.metrics(),
                    size: 0,
                    clock: time,
                    inner,
                    status: head.status,
                    path: pattern_or_path,
                    method,
                })
            } else {
                EitherBody::left(StreamLog {
                    body,
                    size: 0,
                    clock: time,
                    inner,
                    status: head.status,
                    path: pattern_or_path,
                    method,
                })
            }
        })))
    }
}

#[doc(hidden)]
/// Middleware service for PrometheusMetrics
pub struct PrometheusMetricsMiddleware<S> {
    service: S,
    inner: Arc<PrometheusMetrics>,
}

impl<S, B> Service<ServiceRequest> for PrometheusMetricsMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
{
    type Error = S::Error;
    type Future = LoggerResponse<S>;
    type Response = ServiceResponse<EitherBody<StreamLog<B>, StreamLog<String>>>;

    dev::forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        LoggerResponse {
            fut: self.service.call(req),
            time: Instant::now(),
            inner: self.inner.clone(),
            _t: PhantomData,
        }
    }
}

pin_project! {
    #[doc(hidden)]
    pub struct StreamLog<B> {
        #[pin]
        body: B,
        size: usize,
        clock: Instant,
        inner: Arc<PrometheusMetrics>,
        status: StatusCode,
        path: String,
        method: Method,
    }


    impl<B> PinnedDrop for StreamLog<B> {
        fn drop(this: Pin<&mut Self>) {
            // update the metrics for this request at the very end of responding
            this.inner
                .update_metrics(&this.path, &this.method, this.status, this.clock);
        }
    }
}

impl<B: MessageBody> MessageBody for StreamLog<B> {
    type Error = B::Error;

    fn size(&self) -> BodySize {
        self.body.size()
    }

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Result<Bytes, Self::Error>>> {
        let this = self.project();
        match ready!(this.body.poll_next(cx)) {
            Some(Ok(chunk)) => {
                *this.size += chunk.len();
                Poll::Ready(Some(Ok(chunk)))
            }
            Some(Err(err)) => Poll::Ready(Some(Err(err))),
            None => Poll::Ready(None),
        }
    }
}
