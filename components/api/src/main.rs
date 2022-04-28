use actix_web::{middleware::Logger, App, HttpServer};
use actix_web_opentelemetry::RequestMetrics;
use config::Config;
use db::DbPool;
use enclave_proxy::{bb8, pool, StreamManager};
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;

mod config;
mod errors;
mod telemetry;

use crate::errors::ApiError;

// TODO put IAM roles and permissions in pulumi

mod auth;
mod challenge;
mod enclave;
mod index;
mod response;
mod tenant;
mod user;

use paperclip::actix::{web, OpenApiExt};

#[derive(Clone)]
pub struct State {
    config: Config,
    pinpoint_client: aws_sdk_pinpoint::Client,
    sms_client: aws_sdk_pinpointsmsvoicev2::Client,
    email_client: aws_sdk_pinpointemail::Client,
    kms_client: aws_sdk_kms::Client,
    db_pool: DbPool,
    enclave_connection_pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = config::Config::load_from_env().expect("failed to load config");

    let _started = telemetry::init(&config).expect("failed to init telemetry layers");

    let meter = opentelemetry::global::meter("actix_web");

    let metrics = RequestMetrics::new(meter, Some(should_render_metrics), None);

    let state = {
        let manager = StreamManager {
            config: config.clone(),
        };

        let pool = bb8::Pool::builder()
            .min_idle(Some(3))
            .max_size(5)
            .build(pool::StreamManager(manager))
            .await
            .unwrap();

        let shared_config = aws_config::from_env().load().await;
        let pinpoint_client = aws_sdk_pinpoint::Client::new(&shared_config);
        let sms_client = aws_sdk_pinpointsmsvoicev2::Client::new(&shared_config);
        let email_client = aws_sdk_pinpointemail::Client::new(&shared_config);
        let kms_client = aws_sdk_kms::Client::new(&shared_config);

        // run migrations
        let _ = db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url)
            .map_err(ApiError::from)
            .unwrap();

        State {
            config: config.clone(),
            enclave_connection_pool: pool,
            pinpoint_client,
            sms_client,
            email_client,
            kms_client,
            db_pool,
        }
    };

    log::info!("starting server on port {}", config.port);

    let res = HttpServer::new(move || {
        let cors = actix_cors::Cors::default()
            .allowed_origin_fn(|origin, _req_head| {
                origin.as_bytes().ends_with(b".footprint.dev")
                    || origin.as_bytes().ends_with(b".onefootprint.com")
            })
            .allowed_origin("http://localhost:8000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT"])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(metrics.clone())
            .wrap(cors)
            .wrap_api()
            .service(index::index::handler)
            .service(index::health::handler)
            .service(enclave::encrypt::handler)
            .service(enclave::decrypt::handler)
            .service(enclave::sign::handler)
            .service(tenant::init::handler)
            .service(tenant::api_init::handler)
            .service(user::init::handler)
            .service(user::update::handler)
            // .service(challenge::initiate::handler)
            // .service(challenge::verify::handler)
            .with_json_spec_at("/open-api/spec")
            .with_swagger_ui_at("/open-api/swagger")
            .build()
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await;

    // telemetry::shutdown();
    res
}

fn should_render_metrics(_: &actix_web::dev::ServiceRequest) -> bool {
    false
}
