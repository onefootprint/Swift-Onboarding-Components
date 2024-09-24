use crate::config::Config;
use anyhow::Result;
use dd_event::DatadogJsonEventFormatter;
use opentelemetry::global;
use opentelemetry::sdk::metrics::controllers::BasicController;
use opentelemetry::sdk::metrics::selectors;
use opentelemetry::sdk::propagation::TraceContextPropagator;
use opentelemetry_otlp::WithExportConfig;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::Layer;
use tracing_subscriber::Registry;

mod dd_event;
mod root_span;

pub use root_span::RootSpan;
pub use root_span::TelemetrySpanBuilder;

// Initialize `tracing` using `opentelemetry-tracing` and configure logging
pub fn init(config: &Config) -> Result<Option<BasicController>> {
    env_logger::init();
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|e| {
        println!("Couldn't construct env filter: {e}");
        EnvFilter::new("info")
    });
    global::set_text_map_propagator(TraceContextPropagator::new());

    let mut layers = vec![];

    if config.pretty_logs.is_some() {
        layers.push(tracing_subscriber::fmt::layer().with_ansi(true).pretty().boxed());
    } else {
        layers.push(
            fmt::layer()
                .json()
                .event_format(DatadogJsonEventFormatter)
                .boxed(),
        );
    }

    let exporter = || {
        if let Some(otel_endpoint) = &config.otel_endpoint {
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(otel_endpoint)
        } else {
            opentelemetry_otlp::new_exporter().tonic()
        }
    };

    if config.disable_traces.is_none() {
        let tracer = opentelemetry_otlp::new_pipeline()
            .tracing()
            .with_exporter(exporter())
            .install_batch(opentelemetry::runtime::Tokio)?;

        layers.push(tracing_opentelemetry::layer().with_tracer(tracer).boxed());
    }

    // n.b.: env_filter needs to go first for level filtering to work correctly.
    let sub = Registry::default().with(env_filter).with(layers);
    tracing::subscriber::set_global_default(sub)?;

    // init metrics
    if config.disable_metrics.is_none() {
        let metrics = opentelemetry_otlp::new_pipeline()
            .metrics(
                selectors::simple::inexpensive(),
                opentelemetry::sdk::export::metrics::aggregation::stateless_temporality_selector(),
                opentelemetry::runtime::Tokio,
            )
            .with_exporter(exporter())
            .build()?;
        Ok(Some(metrics))
    } else {
        Ok(None)
    }
}

#[allow(unused)]
pub fn shutdown() {
    global::shutdown_tracer_provider();
}
