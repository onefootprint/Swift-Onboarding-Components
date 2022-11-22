use actix_web::{middleware::Logger, App, HttpServer, ResponseError};

use std::borrow::Cow;
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;

mod config;
mod prometheus;
mod signed_hash;
mod telemetry;

mod auth;
mod decision;
mod enclave_client;
mod errors;
mod routes;
mod serializers;
use self::routes::*;
mod s3;
mod state;
mod types;
mod utils;


use crate::errors::ApiError;
use paperclip::actix::{web, OpenApiExt};

pub use self::state::State;

lazy_static::lazy_static! {
    pub static ref GIT_HASH:&'static str = env!("GIT_HASH");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = config::Config::load_from_env().expect("failed to load config");

    // telemetry
    let _controller = telemetry::init(&config).expect("failed to init telemetry layers");
    let prometheus = prometheus::init(&config);

    // sentry
    let sample_rate = if config.service_config.is_local() {
        // Don't send local errors to sentry
        0.0
    } else {
        1.0
    };
    let _guard = sentry::init((
        config.sentry_url.as_str(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            environment: Some(Cow::Owned(config.service_config.environment.clone())),
            sample_rate,
            ..Default::default()
        },
    ));

    // Add custom sentry tags here!
    sentry::configure_scope(|scope| {
        scope.set_tag("footprint-server-version", crate::GIT_HASH.to_string());
    });

    std::env::set_var("RUST_BACKTRACE", "1");

    let state = State::init_or_die(config.clone()).await;

    log::info!("starting server on port {}", config.port);

    // telemetry::shutdown();
    HttpServer::new(move || {
        let cors = actix_cors::Cors::default()
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
            .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidJsonBody(err)));

        let query_cfg = web::QueryConfig::default()
            .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidQueryParam(err)));

        let form_cfg = web::FormConfig::default()
            .limit(32_768)
            .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidFormError(err)));

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(prometheus.clone())
            .wrap(
                sentry_actix::Sentry::builder()
                    .capture_server_errors(true)
                    .start_transaction(true)
                    .finish(),
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
            .wrap_api()
            .configure(routes::routes)
            .with_json_spec_at("docs-spec")
            .with_json_spec_v3_at("docs-spec-v3")
            .with_rapidoc_at("docs-ui")
            .default_service(actix_web::web::to(default_not_found))
            .build()
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

async fn default_not_found() -> impl actix_web::Responder {
    ApiError::EndpointNotFound.error_response()
}
