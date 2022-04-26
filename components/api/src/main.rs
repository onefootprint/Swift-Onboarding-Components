use actix_web::{
    get, middleware::Logger, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_opentelemetry::RequestMetrics;
use config::Config;
use enclave_proxy::{bb8, pool, EnclavePayload, RpcPayload, StreamManager};
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;
use db::DbPool;

mod config;
mod telemetry;
mod errors;

use crate::errors::ApiError;

// TODO put IAM roles and permissions in pulumi

#[tracing::instrument(name = "index", skip(req))]
#[get("/")]
async fn index(req: HttpRequest) -> impl Responder {
    let mut headers = req
        .headers()
        .iter()
        .filter(|(name, _)| {
            name.as_str().to_lowercase() != "X-Token-From-Cloudfront".to_lowercase()
        })
        .map(|(name, value)| {
            let val = value.to_str().unwrap_or("?");
            format!("{name} -> {val}")
        })
        .collect::<Vec<String>>();

    headers.sort();

    log_headers(&headers);

    let headers = headers.join("\n");

    HttpResponse::Ok().body(format!("{headers}"))
}

#[tracing::instrument(name = "health", skip(state))]
#[get("/health")]
async fn health(state: web::Data<State>) -> Result<impl Responder, ApiError> {
    let enclave_health = {
        let mut conn = state.enclave_connection_pool.get().await?;
        let req = enclave_proxy::RpcRequest::new(RpcPayload::Ping("test".into()));

        tracing::info!("sending request");
        let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;

        if let EnclavePayload::Pong(response) = response {
            response
        } else {
            "invalid enclave response".to_string()
        }
    };

    let db_health = db::health_check(&state.db_pool).await?.id.to_string();

    Ok(format!(
        "Enclave: got {}\nDB: got tenant {}",
        enclave_health, db_health
    ))
}

#[tracing::instrument(name = "log_headers")]
fn log_headers(headers: &Vec<String>) {
    tracing::info!("got headers");
}

mod tenant;
mod challenge;
mod user;
mod enclave;

#[derive(Clone)]
pub struct State {
    config: Config,
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
        let sms_client = aws_sdk_pinpointsmsvoicev2::Client::new(&shared_config);
        let email_client = aws_sdk_pinpointemail::Client::new(&shared_config);
        let kms_client = aws_sdk_kms::Client::new(&shared_config);

        // run migrations
        let _ = db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url).map_err(ApiError::from)
        .unwrap();

        State {
            config: config.clone(),
            enclave_connection_pool: pool,
            sms_client,
            email_client,
            kms_client,
            db_pool,
        }
    };

    log::info!("starting server on port {}", config.port);

    let res = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(metrics.clone())
            .service(index)
            .service(health)
            .service(enclave::encrypt)
            .service(enclave::decrypt)
            .service(enclave::sign)
            .service(tenant::init)
            .service(tenant::api_init)
            .service(user::init)
            .service(user::update)
            .service(challenge::create)
            .service(challenge::verify)
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
