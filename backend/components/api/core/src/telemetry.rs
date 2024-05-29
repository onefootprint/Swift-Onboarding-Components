use crate::config::Config;
use crate::utils::headers::{
    InsightHeaders,
    TelemetryHeaders,
};
use actix_web::FromRequest;
use anyhow::Result;
use chrono::{
    SecondsFormat,
    Utc,
};
use futures_util::Future;
use itertools::Itertools;
use opentelemetry::global;
use opentelemetry::sdk::metrics::controllers::BasicController;
use opentelemetry::sdk::metrics::selectors;
use opentelemetry::sdk::propagation::TraceContextPropagator;
use opentelemetry::trace::{
    SpanId,
    TraceContextExt,
    TraceId,
};
use opentelemetry_otlp::WithExportConfig;
use serde::ser::SerializeMap;
use serde::Serializer;
use std::io;
use std::pin::Pin;
use tracing::{
    Span,
    Subscriber,
};
use tracing_actix_web::{
    root_span,
    DefaultRootSpanBuilder,
    RootSpanBuilder,
};
use tracing_core::Event;
use tracing_opentelemetry::OtelData;
use tracing_serde::fields::AsMap;
use tracing_serde::AsSerde;
use tracing_subscriber::fmt::format::Writer;
use tracing_subscriber::fmt::{
    self,
    FmtContext,
    FormatEvent,
    FormatFields,
};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::registry::{
    LookupSpan,
    SpanRef,
};
use tracing_subscriber::{
    EnvFilter,
    Layer,
    Registry,
};

// Initialize `tracing` using `opentelemetry-tracing` and configure logging
pub fn init(config: &Config) -> Result<Option<BasicController>> {
    env_logger::init();
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

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

        // Put on the root_span the properties that are must useful to query by/view in aggregate in
        // honeycomb. We have almost every other attribute logged as an event, rather than as an
        // attribute on the span. Note: It seems we can only provide a fixed number of args to the
        // root_span - you may have to remove some if you add more.
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

struct DatadogJsonEventFormatter;

impl<S, N> FormatEvent<S, N> for DatadogJsonEventFormatter
where
    S: Subscriber + for<'lookup> LookupSpan<'lookup>,
    N: for<'writer> FormatFields<'writer> + 'static,
{
    fn format_event(
        &self,
        ctx: &FmtContext<'_, S, N>,
        mut writer: Writer<'_>,
        event: &Event<'_>,
    ) -> std::fmt::Result
    where
        S: Subscriber + for<'a> LookupSpan<'a>,
    {
        // See https://github.com/tokio-rs/tracing/issues/1531
        // Maybe there will be an easier way to do this in the future.

        let meta = event.metadata();

        let mut visit = || {
            let mut s = serde_json::Serializer::new(WriteAdaptor(&mut writer));

            let mut s = s.serialize_map(None)?;
            s.serialize_entry(
                "timestamp",
                &Utc::now().to_rfc3339_opts(SecondsFormat::Micros, true),
            )?;
            s.serialize_entry("level", &meta.level().as_serde())?;
            s.serialize_entry("fields", &event.field_map())?;
            s.serialize_entry("target", meta.target())?;

            if let Some(file) = meta.file() {
                s.serialize_entry("filename", file)?;
            }
            if let Some(line) = meta.line() {
                s.serialize_entry("line_number", &line)?;
            }

            if let Some(ref span_ref) = ctx.lookup_current() {
                if let Some(root_span_ref) = span_ref.scope().from_root().next() {
                    ser_root_span_attrs(&root_span_ref, &mut s)?;
                }

                if let Some((trace_id, span_id)) = lookup_trace_ids(span_ref) {
                    s.serialize_entry("dd.trace_id", &trace_id.to_string())?;
                    s.serialize_entry("dd.span_id", &span_id.to_string())?;
                }
            }

            s.end()
        };

        visit().map_err(|_| std::fmt::Error)?;
        writeln!(writer)
    }
}

struct WriteAdaptor<'a, 'b>(&'a mut Writer<'b>);

impl<'a, 'b> io::Write for WriteAdaptor<'a, 'b> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let s = std::str::from_utf8(buf).map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

        self.0
            .write_str(s)
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

        Ok(s.as_bytes().len())
    }

    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}

fn lookup_trace_ids<S>(span_ref: &SpanRef<S>) -> Option<(TraceId, SpanId)>
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    span_ref.extensions().get::<OtelData>().map(|o| {
        let trace_id = if o.parent_cx.has_active_span() {
            o.parent_cx.span().span_context().trace_id()
        } else {
            o.builder.trace_id.unwrap_or(TraceId::INVALID)
        };

        let span_id = o.builder.span_id.unwrap_or(SpanId::INVALID);

        (trace_id, span_id)
    })
}

// Copies root span attributes to associated log events.
fn ser_root_span_attrs<S, T>(root_span_ref: &SpanRef<T>, serializer: &mut S) -> Result<(), S::Error>
where
    S: SerializeMap,
    T: Subscriber + for<'a> LookupSpan<'a>,
{
    let ext = root_span_ref.extensions();
    if let Some(attributes) = ext.get::<OtelData>().and_then(|o| o.builder.attributes.as_ref()) {
        for (k, v) in attributes {
            let k = k.as_str();
            match k {
                // Note that these fields are written at the top level of the log event for ease of
                // querying, so they must not collide with standard attributes.
                //
                // Omitted fields:
                //   - server_git_hash: Redundant with Datadog's version tag.
                "tenant_id"
                | "fp_id"
                | "vault_id"
                | "is_live"
                | "auth_method"
                | "auth_token_hash"
                | "client_version"
                | "session_id"
                | "is_integration_test_req"
                | "route"
                | "ip_address"
                | "country"
                | "user_agent"
                | "http.route"
                | "http.target" => match v {
                    opentelemetry::Value::Bool(v) => serializer.serialize_entry(k, v)?,
                    opentelemetry::Value::I64(v) => serializer.serialize_entry(k, v)?,
                    opentelemetry::Value::F64(v) => serializer.serialize_entry(k, v)?,
                    opentelemetry::Value::String(v) => serializer.serialize_entry(k, v.as_ref())?,
                    opentelemetry::Value::Array(opentelemetry::Array::Bool(v)) => {
                        serializer.serialize_entry(k, &v)?
                    }
                    opentelemetry::Value::Array(opentelemetry::Array::I64(v)) => {
                        serializer.serialize_entry(k, &v)?
                    }
                    opentelemetry::Value::Array(opentelemetry::Array::F64(v)) => {
                        serializer.serialize_entry(k, &v)?
                    }
                    opentelemetry::Value::Array(opentelemetry::Array::String(v)) => {
                        serializer.serialize_entry(k, &v.iter().map(|v| v.as_str()).collect_vec())?
                    }
                },
                _ => {}
            }
        }
    }

    Ok(())
}
