use crate::utils::headers::InsightHeaders;
use crate::utils::headers::TelemetryHeaders;
use actix_web::FromRequest;
use actix_web::HttpMessage;
use anyhow::Result;
use api_errors::ResponseErrorContext;
use db::models::scoped_vault::ScopedVault;
use futures_util::Future;
use std::pin::Pin;
use tracing::Span;
use tracing_actix_web::root_span;
use tracing_actix_web::DefaultRootSpanBuilder;
use tracing_actix_web::RootSpanBuilder;

pub struct TelemetrySpanBuilder;

impl RootSpanBuilder for TelemetrySpanBuilder {
    fn on_request_start(request: &actix_web::dev::ServiceRequest) -> Span {
        let route = format!(
            "{} {}",
            request.method().as_str(),
            request.uri().path_and_query().map(|p| p.as_str()).unwrap_or("")
        );

        let InsightHeaders {
            ip_address, country, ..
        } = InsightHeaders::parse_from_request(request.request());

        let TelemetryHeaders {
            session_id,
            is_integration_test_req,
            client_version,
        } = TelemetryHeaders::parse_from_request(request.headers());

        // fp_session_id is used in telemetry to avoid conflicting with session_id, which is reserved for
        // Datadog RUM.
        let fp_session_id = session_id.map(|s| format!("{}", s));
        // Continue emitting session_id to support Honeycomb workflows.
        let session_id = fp_session_id.clone();

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
            is_live = tracing::field::Empty,
            auth_method = tracing::field::Empty,
            // Allow associating requests made with the same auth token, even if the auth extractor failed
            auth_token_hash = tracing::field::Empty,
            // Free-form data to be added by individual APIs if they choose
            meta = tracing::field::Empty,
            client_version,
            fp_session_id,
            session_id,
            server_git_hash,
            is_integration_test_req,
            route,
            ip_address,
            country,
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
        DefaultRootSpanBuilder::on_request_end(span, outcome);

        // Emit a log line after every HTTP request.
        // This log line is very precariously placed to happen after the response attributes are added to
        // the root span in DefaultRootSpanBuilder::on_request_end(span, outcome);
        // It largely makes use of DatadogJsonEventFormatter to automatically add useful attributes from the
        // root span to the log line.
        let (name, err_ctx) = match outcome {
            Ok(r) => {
                let req = r.request();
                let err_ctx = req.extensions().get::<ResponseErrorContext>().cloned();
                let name = format!(
                    "{} {}",
                    req.method().as_str(),
                    req.match_pattern().unwrap_or("default".into())
                );
                (name, err_ctx)
            }
            // API errors don't end up in this branch. I'm not sure in what situations we have an Err here.
            Err(_) => ("Canonical log line".to_string(), None),
        };
        let (error_message, error_location) =
            err_ctx.map(|ctx| (ctx.message, ctx.location)).unwrap_or_default();
        tracing::info!(is_root = true, error.message=%error_message, error.stack=%error_location, "{}", name);
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

impl RootSpan {
    pub fn record_su(&self, su: &ScopedVault) {
        self.record("vault_id", su.vault_id.to_string());
        self.record("fp_id", su.fp_id.to_string());
        self.record("tenant_id", su.tenant_id.to_string());
        self.record("is_live", su.is_live);
    }
}

impl paperclip::actix::OperationModifier for RootSpan {}
