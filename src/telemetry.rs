use opentelemetry::global;
use opentelemetry::sdk::propagation::TraceContextPropagator;
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

pub fn init(config: &Config) -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    global::set_text_map_propagator(TraceContextPropagator::new());

    let env_filter = EnvFilter::try_from_default_env().unwrap_or(EnvFilter::new("info"));
    let formatting_layer = BunyanFormattingLayer::new(
        "fcm".into(),
        // Output the formatted spans to stdout.
        std::io::stdout,
    );

    let tracer = opentelemetry_datadog::new_pipeline()
        .with_agent_endpoint("http://0.0.0.0:8126")
        .with_service_name("fpc")
        .install_batch(opentelemetry::runtime::Tokio)?;

    // Initialize `tracing` using `opentelemetry-tracing` and configure logging
    let sub = Registry::default()
        .with(env_filter)
        .with(JsonStorageLayer)
        .with(tracing_subscriber::fmt::layer().pretty())
        // .with(formatting_layer)
        .with(tracing_opentelemetry::layer().with_tracer(tracer));

    tracing::subscriber::set_global_default(sub)?;

    Ok(())
}

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
        let _ = span.enter();
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
