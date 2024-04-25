use std::pin::Pin;

use actix_web::FromRequest;
use futures_util::Future;
use opentelemetry::{
    global,
    sdk::{
        metrics::{controllers::BasicController, selectors},
        propagation::TraceContextPropagator,
    },
};
use opentelemetry_otlp::WithExportConfig;
use tracing::Span;
use tracing_actix_web::{root_span, DefaultRootSpanBuilder, RootSpanBuilder};
use tracing_subscriber::{prelude::*, EnvFilter, Layer, Registry};

use crate::{
    config::Config,
    utils::headers::{InsightHeaders, TelemetryHeaders},
};
use anyhow::Result;

// Initialize `tracing` using `opentelemetry-tracing` and configure logging
pub fn init(config: &Config) -> Result<Option<BasicController>> {
    env_logger::init();
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    global::set_text_map_propagator(TraceContextPropagator::new());

    let mut layers = vec![];

    if config.pretty_logs.is_some() {
        layers.push(tracing_subscriber::fmt::layer().with_ansi(true).pretty().boxed());
    } else {
        layers.push(tracing_subscriber::fmt::layer().json().boxed());
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

    // sentry layer
    if config.disable_sentry.is_none() {
        let sentry_layer = sentry_tracing::layer().event_filter(|md| match *md.level() {
            tracing::Level::ERROR => sentry_tracing::EventFilter::Exception,
            tracing::Level::INFO | tracing::Level::DEBUG => sentry_tracing::EventFilter::Breadcrumb,
            _ => sentry_tracing::EventFilter::Ignore,
        });

        layers.push(sentry_layer.boxed());
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

pub struct TelemetrySpanBuilder;
impl RootSpanBuilder for TelemetrySpanBuilder {
    fn on_request_start(request: &actix_web::dev::ServiceRequest) -> Span {
        let route = format!(
            "{} {}",
            request.method().as_str(),
            request.uri().path_and_query().map(|p| p.as_str()).unwrap_or("")
        );

        let InsightHeaders {
            ip_address,
            country,
            user_agent,
            ..
        } = InsightHeaders::parse_from_request(request.request());

        let TelemetryHeaders {
            session_id,
            is_integration_test_req,
            client_version,
        } = TelemetryHeaders::parse_from_request(request.headers());
        let session_id = session_id.map(|s| format!("{}", s));

        let server_git_hash = crate::GIT_HASH.to_string();

        // Put on the root_span the properties that are must useful to query by/view in aggregate in honeycomb.
        // We have almost every other attribute logged as an event, rather than as an attribute on the span.
        // Note: It seems we can only provide a fixed number of args to the root_span - you may
        // have to remove some if you add more.
        // If we can increase the number of attributes on the span, maybe we can put everything here
        let span = root_span!(
            request,
            tenant_id = tracing::field::Empty,
            fp_id = tracing::field::Empty, // maybe replace with scoped_vault_id, available in more places
            vault_id = tracing::field::Empty,
            is_live = tracing::field::Empty,
            auth_method = tracing::field::Empty,
            // Allow associating requests made with the same auth token, even if the auth extractor failed
            auth_token_hash = tracing::field::Empty,
            // Free-form data to be added by individual APIs if they choose
            meta = tracing::field::Empty,
            client_version,
            session_id,
            server_git_hash,
            is_integration_test_req,
            route,
            ip_address,
            country,
            user_agent,
            // This is already logged by the macro, but we want to overshadow it with a field that
            // excludes the HTTP path
            http.target = %request.uri().path(),
            "Root span"
        );
        span
    }

    fn on_request_end<B: actix_web::body::MessageBody>(
        span: Span,
        outcome: &Result<actix_web::dev::ServiceResponse<B>, actix_web::Error>,
    ) {
        DefaultRootSpanBuilder::on_request_end(span, outcome)
    }
}

/// Wrapper around tracing_actix_web::RootSpan that also implements paperclip Apiv2Schema
#[derive(derive_more::Deref, Clone)]
pub struct RootSpan(#[deref] tracing_actix_web::RootSpan);

impl FromRequest for RootSpan {
    type Error = <tracing_actix_web::RootSpan as FromRequest>::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let root_span = <tracing_actix_web::RootSpan as FromRequest>::from_request(req, payload);
        Box::pin(async move {
            let root_span = root_span.await?;
            Ok(Self(root_span))
        })
    }
}

impl paperclip::v2::schema::Apiv2Schema for RootSpan {
    fn name() -> Option<String> {
        Some("RootSpan".to_string())
    }

    fn description() -> &'static str {
        "Wrapper around tracing_actix_web::RootSpan that also implements paperclip Apiv2Schema"
    }
}

impl paperclip::actix::OperationModifier for RootSpan {}
