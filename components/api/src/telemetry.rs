use futures_util::Stream;
use futures_util::StreamExt;
use opentelemetry::global;
use opentelemetry::sdk::metrics::selectors;
use opentelemetry::sdk::metrics::PushController;
use opentelemetry::sdk::propagation::TraceContextPropagator;
use opentelemetry_otlp::WithExportConfig;
use tracing::Span;
use tracing_actix_web::root_span;
use tracing_actix_web::DefaultRootSpanBuilder;
use tracing_actix_web::RootSpanBuilder;
use tracing_bunyan_formatter::JsonStorageLayer;
use tracing_subscriber::prelude::*;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::Registry;

use crate::config::Config;
use crate::utils::insight_headers::InsightHeaders;

pub fn init(config: &Config) -> Result<Option<PushController>, Box<dyn std::error::Error>> {
    env_logger::init();
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    global::set_text_map_propagator(TraceContextPropagator::new());

    // don't setup the exporter
    if config.disable_otel.is_some() {
        let sub = Registry::default()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().pretty());

        tracing::subscriber::set_global_default(sub)?;
        return Ok(None);
    }

    let exporter = if let Some(otel_endpoint) = &config.otel_endpoint {
        opentelemetry_otlp::new_exporter()
            .tonic()
            .with_endpoint(otel_endpoint)
    } else {
        opentelemetry_otlp::new_exporter().tonic()
    };

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(exporter)
        .install_simple()?;

    // Initialize `tracing` using `opentelemetry-tracing` and configure logging
    let sub = Registry::default()
        .with(env_filter)
        .with(JsonStorageLayer)
        .with(tracing_opentelemetry::layer().with_tracer(tracer))
        .with(tracing_subscriber::fmt::layer().pretty());
    // .with(formatting_layer)

    tracing::subscriber::set_global_default(sub)?;

    // init metrics
    fn delayed_interval(duration: std::time::Duration) -> impl Stream<Item = tokio::time::Instant> {
        opentelemetry::util::tokio_interval_stream(duration).skip(1)
    }
    let metrics = opentelemetry_otlp::new_pipeline()
        .metrics(tokio::spawn, delayed_interval)
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .with_aggregator_selector(selectors::simple::Selector::Exact)
        .build()?;

    Ok(Some(metrics))
}

#[allow(unused)]
pub fn shutdown() {
    global::shutdown_tracer_provider();
}

pub struct TelemetrySpanBuilder;
impl RootSpanBuilder for TelemetrySpanBuilder {
    fn on_request_start(request: &actix_web::dev::ServiceRequest) -> Span {
        let route = format!(
            "{} {}",
            request.method().as_str(),
            request.uri().path_and_query().map(|p| p.as_str()).unwrap_or("")
        );
        let span = root_span!(request);

        let InsightHeaders {
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            timestamp,
        } = InsightHeaders::parse_from_request(request.headers());

        let e = span.enter();

        tracing::info!(
            route=%route, 
            ip=?ip_address.unwrap_or_else(|| "".into()), 
            lat=?latitude.unwrap_or_else(|| "".into()), 
            lon=?longitude.unwrap_or_else(|| "".into()),
            city=?city.unwrap_or_else(|| "".into()),
            country=?country.unwrap_or_else(|| "".into()),
            region=?region.unwrap_or_else(|| "".into()),
            region_name=?region_name.unwrap_or_else(|| "".into()),
            metro_code=?metro_code.unwrap_or_else(|| "".into()),
            postal_code=?postal_code.unwrap_or_else(|| "".into()),
            time_zone=?time_zone.unwrap_or_else(|| "".into()),
            user_agent=?user_agent.unwrap_or_else(|| "".into()),
            timestamp=%timestamp,
            "request start");
        std::mem::drop(e);
        span
    }

    fn on_request_end<B>(span: Span, outcome: &Result<actix_web::dev::ServiceResponse<B>, actix_web::Error>) {
        DefaultRootSpanBuilder::on_request_end(span, outcome)
    }
}
