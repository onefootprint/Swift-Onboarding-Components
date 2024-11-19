use anyhow::Result;
use chrono::SecondsFormat;
use chrono::Utc;
use itertools::Itertools;
use opentelemetry::trace::SpanId;
use opentelemetry::trace::TraceContextExt;
use opentelemetry::trace::TraceId;
use serde::ser::SerializeMap;
use serde::Serializer;
use std::io;
use tracing::Subscriber;
use tracing_core::Event;
use tracing_opentelemetry::OtelData;
use tracing_serde::fields::AsMap;
use tracing_serde::AsSerde;
use tracing_serde::SerdeMapVisitor;
use tracing_subscriber::fmt::format::Writer;
use tracing_subscriber::fmt::FmtContext;
use tracing_subscriber::fmt::FormatEvent;
use tracing_subscriber::fmt::FormatFields;
use tracing_subscriber::registry::LookupSpan;
use tracing_subscriber::registry::SpanRef;

pub struct DatadogJsonEventFormatter;

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

            let s = s.serialize_map(None)?;
            let mut s = TrackKeysSerializeMap::new(s);

            s.serialize_entry(
                "timestamp",
                &Utc::now().to_rfc3339_opts(SecondsFormat::Micros, true),
            )?;
            s.serialize_entry("level", &meta.level().as_serde())?;
            s.serialize_entry("target", meta.target())?;

            if let Some(file) = meta.file() {
                s.serialize_entry("filename", file)?;
            }
            if let Some(line) = meta.line() {
                s.serialize_entry("line_number", &line)?;
            }

            if let Some(ref span_ref) = ctx.lookup_current() {
                // Attach all properties of the root span to each log line that we emit
                if let Some(root_span_ref) = span_ref.scope().from_root().next() {
                    ser_root_span_attrs(&root_span_ref, &mut s)?;
                }

                if let Some((trace_id, span_id)) = lookup_trace_ids(span_ref) {
                    s.serialize_entry("dd.trace_id", &trace_id.to_string())?;
                    s.serialize_entry("dd.span_id", &span_id.to_string())?;
                    // Also emit the trace ID to support finding other logs from this trace. The above fields
                    // are absorbed by datadog
                    s.serialize_entry("trace_id", &trace_id.to_string())?;
                }
            }
            s.serialize_entry("git.commit.sha", &crate::GIT_HASH.to_string())?;
            s.serialize_entry("git.repository_url", "https://github.com/onefootprint/monorepo")?;

            // Keeping this for backwards compatibility.
            // TODO: will remove soon
            s.serialize_entry("fields", &event.field_map())?;

            // AS THE VERY LAST STEP, serialize all user-provided fields from the log line.
            // Our TrackKeysSerializeMap will automatically prefix any user-provided fields that conflict with
            // any of the reserved fields set above.
            let mut visitor = SerdeMapVisitor::new(s);
            event.record(&mut visitor);
            visitor.finish()
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

/// These fields are set on the root tracing span and are automatically attached to each log line
/// when populated. They generally should not be set explicitly in any `tracing::info!` (or other
/// `tracing::event!`) log lines, unless it is known that the root span is missing the field.
const RESERVED_ROOT_SPAN_FIELDS: &[&str] = &[
    "tenant_id",
    "fp_id",
    "vault_id",
    "is_live",
    "auth_method",
    "auth_token_hash",
    "meta",
    "client_version",
    "session_id",
    "fp_session_id",
    "is_integration_test_req",
    "route",
    "ip_address",
    "country",
    "support_id",
    "request_id",
    "server_git_hash",
    "exception.message",
    "exception.details",
    "http.client_ip",
    "http.host",
    "http.user_agent",
    "http.method",
    "http.status_code",
    "http.route",
    "http.target",
];

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
            if !RESERVED_ROOT_SPAN_FIELDS.contains(&k) {
                continue;
            }
            // Note that these fields are written at the top level of the log event for ease of
            // querying, so they must not collide with standard attributes.
            //
            // Omitted fields:
            //   - server_git_hash: Redundant with Datadog's version tag.
            match v {
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
            }
        }
    }

    Ok(())
}

/// Wrapper around a SerializeMap that keeps track of which fields have been written.
/// If a single key is written twice, we prefix it `CONFLICTING_FIELD.` to deduplicate
pub struct TrackKeysSerializeMap<S> {
    inner: S,
    fields: Vec<String>,
}

impl<S> TrackKeysSerializeMap<S> {
    fn new(inner: S) -> Self {
        Self {
            inner,
            fields: vec![],
        }
    }
}

impl<S> SerializeMap for TrackKeysSerializeMap<S>
where
    S: SerializeMap,
{
    type Error = S::Error;
    type Ok = S::Ok;

    fn serialize_key<T: serde::Serialize + ?Sized>(
        &mut self,
        key: &T,
    ) -> std::result::Result<(), Self::Error> {
        if let Ok(serde_json::Value::String(key)) = serde_json::to_value(key) {
            let key_is_already_used = self.fields.contains(&key);
            if key_is_already_used {
                tracing::info!(field_key=%key, "Conflicting tracing field");
                // Add a prefix to the key so we don't overwrite any existing fields
                let key = format!("CONFLICTING_FIELD.{}", key);
                return self.serialize_key(&key);
            }
            self.fields.push(key);
        }
        self.inner.serialize_key(key)
    }

    fn serialize_value<T: serde::Serialize + ?Sized>(
        &mut self,
        value: &T,
    ) -> std::result::Result<(), Self::Error> {
        self.inner.serialize_value(value)
    }

    fn end(self) -> std::result::Result<Self::Ok, Self::Error> {
        self.inner.end()
    }
}
