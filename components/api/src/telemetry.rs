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
use tracing_bunyan_formatter::BunyanFormattingLayer;
use tracing_bunyan_formatter::JsonStorageLayer;
use tracing_subscriber::prelude::*;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::Registry;

use crate::config::Config;

pub fn init(config: &Config) -> Result<PushController, Box<dyn std::error::Error>> {
    env_logger::init();

    global::set_text_map_propagator(TraceContextPropagator::new());

    let env_filter = EnvFilter::try_from_default_env().unwrap_or(EnvFilter::new("info"));
    let _formatting_layer = BunyanFormattingLayer::new(
        "fcm".into(),
        // Output the formatted spans to stdout.
        std::io::stdout,
    );

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

    Ok(metrics)
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
            request
                .uri()
                .path_and_query()
                .map(|p| p.as_str())
                .unwrap_or("")
        );
        let span = root_span!(request);
        tracing::info!("{}", route);
        return span;
    }

    fn on_request_end<B>(
        span: Span,
        outcome: &Result<actix_web::dev::ServiceResponse<B>, actix_web::Error>,
    ) {
        DefaultRootSpanBuilder::on_request_end(span, outcome)
    }
}
