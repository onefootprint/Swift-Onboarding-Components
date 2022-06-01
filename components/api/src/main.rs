use std::time::Duration;

use actix_session::{storage::CookieSessionStore, SessionMiddleware};
use actix_web::{cookie::Key, middleware::Logger, App, HttpServer};
use actix_web_opentelemetry::RequestMetrics;
use config::Config;
use crypto::aead::ScopedSealingKey;
use db::DbPool;
use enclave_proxy::{
    bb8::{self, ErrorSink},
    pool, StreamManager,
};
use signed_hash::SignedHashClient;
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;

mod config;
mod errors;
mod signed_hash;
mod telemetry;

use crate::{errors::ApiError, tenant::workos::WorkOSClient};

// TODO put IAM roles and permissions in pulumi

mod auth;
mod client;
mod enclave;
mod identify;
mod index;
mod liveness;
mod onboarding;
mod tenant;
mod types;
mod user;
mod utils;

use paperclip::actix::{web, OpenApiExt};

#[derive(Clone)]
pub struct State {
    config: Config,
    pinpoint_client: aws_sdk_pinpoint::Client,
    sms_client: aws_sdk_pinpointsmsvoicev2::Client,
    email_client: aws_sdk_pinpointemail::Client,
    kms_client: aws_sdk_kms::Client,
    hmac_client: SignedHashClient,
    workos_client: WorkOSClient,
    db_pool: DbPool,
    enclave_connection_pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
    session_sealing_key: ScopedSealingKey,
}

/// Record errors that occur from enclave pool connections
#[derive(Debug, Clone)]
struct EnclavePoolErrorSink;
impl ErrorSink<enclave_proxy::Error> for EnclavePoolErrorSink {
    fn sink(&self, error: enclave_proxy::Error) {
        tracing::error!(target: "enclave_pool_error", error=?error, "enclave connection pool error");
    }

    fn boxed_clone(&self) -> Box<(dyn ErrorSink<enclave_proxy::Error> + 'static)> {
        Box::new(self.clone())
    }
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
            .connection_timeout(Duration::from_secs(10))
            .test_on_check_out(false)
            .error_sink(Box::new(EnclavePoolErrorSink))
            .build(pool::StreamManager(manager))
            .await
            .unwrap();

        let shared_config = aws_config::from_env().load().await;
        let pinpoint_client = aws_sdk_pinpoint::Client::new(&shared_config);
        let sms_client = aws_sdk_pinpointsmsvoicev2::Client::new(&shared_config);
        let email_client = aws_sdk_pinpointemail::Client::new(&shared_config);
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = SignedHashClient {
            client: kms_client.clone(),
            key_id: config.signing_root_key_id.clone(),
        };

        let workos_client = WorkOSClient {
            client_id: config.workos_client_id.clone(),
            client_secret: config.workos_api_key.clone(),
            default_org: config.workos_default_org.clone(),
        };

        // let out = hmac_client
        //     .signed_hash(&vec![0xde, 0xad, 0xbe, 0xef])
        //     .await
        //     .unwrap();
        // dbg!(crypto::hex::encode(&out));

        // run migrations
        let _ = db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url)
            .map_err(ApiError::from)
            .unwrap();

        // our session key
        let session_sealing_key = {
            let key = if let Some(hex_key) = &config.cookie_session_key_hex {
                crypto::hex::decode(hex_key).expect("invalid session cookie key")
            } else {
                log::error!("WARNING GENERATING RANDOM SESSION KEY");
                crypto::random::random_cookie_session_key_bytes()
            };
            ScopedSealingKey::new(key, "SESSION_SEALING").expect("invalid cookie session key")
        };

        State {
            config: config.clone(),
            enclave_connection_pool: pool,
            pinpoint_client,
            sms_client,
            email_client,
            kms_client,
            hmac_client,
            workos_client,
            db_pool,
            session_sealing_key,
        }
    };

    log::info!("starting server on port {}", config.port);

    // our session key
    let session_key = if let Some(hex_key) = config.cookie_session_key_hex {
        crypto::hex::decode(hex_key).expect("invalid session cookie key")
    } else {
        log::error!("WARNING GENERATING RANDOM SESSION KEY");
        crypto::random::random_cookie_session_key_bytes()
    };

    let is_https = config.use_local.is_none();
    let cookie_domain = format!(".{}", &config.cookie_domain);

    let res = HttpServer::new(move || {
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
            .limit(16_384)
            // accept any content type
            .content_type(|_| true)
            // use custom error handler
            .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidJsonBody(err)));

        let session_middleware =
            SessionMiddleware::builder(CookieSessionStore::default(), Key::from(&session_key))
                .cookie_path("/".to_string())
                .cookie_secure(is_https)
                .cookie_content_security(actix_session::CookieContentSecurity::Private)
                .cookie_same_site(actix_web::cookie::SameSite::Lax)
                .cookie_domain(Some(cookie_domain.clone()))
                .build();

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(actix_web::middleware::NormalizePath::trim())
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(metrics.clone())
            .wrap(cors)
            .app_data(json_cfg)
            .wrap(session_middleware)
            .wrap_api()
            .service(web::scope("/private").service(client::init::handler))
            .service(identify::routes())
            .service(tenant::routes())
            .service(liveness::routes())
            .service(onboarding::routes())
            .service(user::routes())
            .service(tenant::workos::routes())
            .service(index::index::handler)
            .service(index::health::handler)
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
