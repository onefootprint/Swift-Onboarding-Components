use tracing_bunyan_formatter::BunyanFormattingLayer;
use tracing_bunyan_formatter::JsonStorageLayer;

use opentelemetry::{global, sdk::propagation::TraceContextPropagator};
use tracing_subscriber::prelude::*;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::Registry;

pub fn init() {
    let app_name = "fpc";

    // Start a new Jaeger trace pipeline.
    // Spans are exported in batch - recommended setup for a production application.
    global::set_text_map_propagator(TraceContextPropagator::new());

    // let tracer = stdout::new_pipeline().install_simple();

    // Filter based on level - trace, debug, info, warn, error
    // Tunable via `RUST_LOG` env variable
    let env_filter = EnvFilter::try_from_default_env().unwrap_or(EnvFilter::new("info"));

    // let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);

    // Create a `tracing` layer to emit spans as structured logs to stdout
    let formatting_layer = BunyanFormattingLayer::new(app_name.into(), std::io::stdout);

    // Combined them all together in a `tracing` subscriber
    let subscriber = Registry::default()
        .with(env_filter)
        .with(JsonStorageLayer)
        // .with(telemetry)
        .with(formatting_layer);

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to install `tracing` subscriber.");
}

pub fn shutdown() {
    opentelemetry::global::shutdown_tracer_provider();
}
