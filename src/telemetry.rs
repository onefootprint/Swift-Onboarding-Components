use opentelemetry::global;
use opentelemetry::sdk::propagation::TraceContextPropagator;
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
