#![warn(clippy::unwrap_used)]
#![warn(clippy::expect_used)]

use std::time::Duration;

use actix_web::http::KeepAlive;
use api_core::{config::Config, *};
mod custom_migrations;
use actix_web_opentelemetry::RequestMetricsBuilder;
use paperclip::v2::models::{DefaultApiRaw, Info, Tag};

#[allow(clippy::expect_used)]
fn main() -> std::io::Result<()> {
    let config = config::Config::load_from_env().expect("failed to load config");

    // sentry
    let sample_rate: f32 = if config.service_config.is_local() {
        // Don't send local errors to sentry
        0.0
    } else {
        1.0
    };

    let _guard: sentry::ClientInitGuard = sentry::init((
        config.sentry_url.as_str(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            environment: Some(Cow::Owned(config.service_config.environment.clone())),
            sample_rate,
            attach_stacktrace: false,
            ..Default::default()
        },
    ));

    // Add custom sentry tags here!
    sentry::configure_scope(|scope| {
        scope.set_tag("footprint-server-version", crate::GIT_HASH.to_string());
    });

    std::env::set_var("RUST_BACKTRACE", "full");

    let runtime = tokio::runtime::Builder::new_multi_thread().enable_all().build()?;
    runtime.block_on(async move { run_server(config).await })
}

#[allow(clippy::expect_used)]
async fn run_server(config: Config) -> std::io::Result<()> {
    // telemetry
    let _controller = telemetry::init(&config).expect("failed to init telemetry layers");
    let prom = prometheus::init(&config);
    metrics::deprecated_register_all_metrics(&prom.registry).expect("Prometheus metrics failed to register");

    let state: State = State::init_or_die(config.clone()).await;

    // run custom migrations if needed
    custom_migrations::run(&state)
        .await
        .expect("failed to run custom migrations");

    log::info!("starting server on port {}", config.port);

    // Export metrics
    let meter = opentelemetry_api::global::meter("actix_web");
    let request_metrics = RequestMetricsBuilder::new().build(meter);

    // telemetry::shutdown();
    HttpServer::new(move || {
        let cors: actix_cors::Cors = actix_cors::Cors::default()
            .allow_any_origin()
            .allow_any_header()
            .allow_any_method()
            .supports_credentials()
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT"])
            .max_age(3600);

        // custom `Json` extractor configuration
        let json_cfg = web::JsonConfig::default()
            // limit request payload size
            .limit(32_768)
            // accept any content type
            .content_type(|_| true)
            // use custom error handler
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(ApiErrorKind::InvalidJsonBody(err))));

        let query_cfg = web::QueryConfig::default()
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(ApiErrorKind::InvalidQueryParam(err))));

        let form_cfg = web::FormConfig::default()
            .limit(32_768)
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(ApiErrorKind::InvalidFormError(err))));


        let  spec = DefaultApiRaw {
            swagger: paperclip::v2::models::Version::V2,            
            host: Some("api.onefootprint.com".to_string()),
            info: Info {
                version: crate::GIT_HASH.to_string(),
                title: "Footprint API".into(),            
                ..Default::default()
            },
            tags: vec![
                Tag {
                    name: "PublicApi".to_string(),
                    ..Default::default()
                },
                Tag {
                    name: "Preview".to_string(),
                    ..Default::default()
                }
            ],
            ..Default::default()
        };

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(prom.clone())
            .wrap(request_metrics.clone()) // Export otel metrics for each API request
            // TODO also wrap RequestTracing::new()
            .wrap(
                sentry_actix::Sentry::new()
            )
            .wrap(actix_web::middleware::NormalizePath::trim())
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(
                actix_web::middleware::DefaultHeaders::new()
                    .add(("X-Footprint-Server-Version", GIT_HASH.to_string())),
            )
            .wrap(cors)
            .app_data(json_cfg)
            .app_data(query_cfg)
            .app_data(form_cfg)
            // exclude from openapi spec generation
            .configure(api_route_private_root::configure)
            .configure(api_route_private_protected::configure)
            .wrap_api_with_spec(spec)
            .configure(api_routes_root::configure)
            .with_json_spec_at("docs-spec")
            .with_json_spec_v3_at("docs-spec-v3")
            .with_rapidoc_at("docs-ui")
            .default_service(actix_web::web::to(default_not_found))
            .build()
    })
    // Our loadbalancer has a keep alive idle timeout of 60s. To make sure that the target doesn't
    // time out while the loadbalancer is waiting for a response, increase the keep alive timeout
    // https://linear.app/footprint/issue/FP-3633/diagnose-502s
    .keep_alive(KeepAlive::Timeout(Duration::from_secs(120)))
    .shutdown_timeout(5)
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

async fn default_not_found() -> impl actix_web::Responder {
    ApiError::from(ApiErrorKind::EndpointNotFound).error_response()
}

#[allow(unused)]
#[allow(clippy::expect_used)]
#[tracing::instrument(skip(config))]
async fn socure_reason_code_check(config: &Config) {
    let socure_client = SocureClient::new(config.socure_config.production_api_key.clone(), false)
        .expect("failed to build socure certification client");

    tracing::info!("[Socure Reason Code check] Beginning check");
    match query_socure_reason_code_endpoint_and_compare_against_enum(&socure_client).await {
        Ok(reason_code_discrepancies) => {
            if reason_code_discrepancies.missing_reason_codes.is_empty()
                && reason_code_discrepancies
                    .differing_description_reason_codes
                    .is_empty()
            {
                tracing::info!("[Socure Reason Code check] no discrepancies between latest API response and defined enum detected");
            } else {
                tracing::warn!(reason_code_discrepancies = format!("{:?}", reason_code_discrepancies), "[Socure Reason Code check] found discrepancies between latest API response and defined enum");
            }
        }
        Err(err) => tracing::warn!(error=?err, "[Socure Reason Code check] Error"),
    }
}
