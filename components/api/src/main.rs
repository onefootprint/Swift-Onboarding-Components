use actix_web::{middleware::Logger, App, HttpServer};
use config::Config;
use crypto::aead::ScopedSealingKey;
use db::DbPool;
use enclave_proxy::{
    bb8::{self, ErrorSink},
    pool, StreamManager,
};
use signed_hash::SignedHashClient;
use std::{borrow::Cow, time::Duration};
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;
use utils::email::SendgridClient;
mod config;
mod errors;
mod signed_hash;
mod telemetry;

use crate::{errors::ApiError, tenant::workos::WorkOSClient, utils::twilio::TwilioClient};

// TODO put IAM roles and permissions in pulumi

mod auth;
mod client;
mod enclave;
mod identify;
mod index;
mod onboarding;
mod private;
mod tenant;
mod types;
mod user;
mod utils;

use paperclip::actix::{web, OpenApiExt};

#[derive(Clone)]
pub struct State {
    config: Config,
    kms_client: aws_sdk_kms::Client,
    hmac_client: SignedHashClient,
    workos_client: WorkOSClient,
    twilio_client: TwilioClient,
    sendgrid_client: SendgridClient,
    db_pool: DbPool,
    enclave_connection_pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
    challenge_sealing_key: ScopedSealingKey,
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

    // telemetry
    let _controller = telemetry::init(&config).expect("failed to init telemetry layers");

    // sentry
    let _guard = if let Some(env) = config.service_environment.clone() {
        Some(sentry::init((
            config.sentry_url.as_str(),
            sentry::ClientOptions {
                release: sentry::release_name!(),
                environment: Some(Cow::Owned(env)),
                ..Default::default()
            },
        )))
    } else {
        None
    };

    std::env::set_var("RUST_BACKTRACE", "1");

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
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = SignedHashClient {
            client: kms_client.clone(),
            key_id: config.signing_root_key_id.clone(),
        };

        let workos_client = WorkOSClient::new(
            config.workos_client_id.clone(),
            config.workos_default_org.clone(),
            config.workos_api_key.clone(),
        );

        let twilio_client = TwilioClient::new(
            config.twilio_acount_sid.clone(),
            config.twilio_api_key.clone(),
            config.twilio_api_key_secret.clone(),
            config.twilio_phone_number.clone(),
            config.time_s_between_sms_challenges,
            config.rp_id.clone(),
        );

        let sendgrid_client = SendgridClient::new(
            config.sendgrid_api_key.clone(),
            config.sendgrid_from_email.clone(),
            config.sendgrid_challenge_template_id.clone(),
        );

        // let out = hmac_client
        //     .signed_hash(&vec![0xde, 0xad, 0xbe, 0xef])
        //     .await
        //     .unwrap();
        // dbg!(crypto::hex::encode(&out));

        // run migrations
        let _ = db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url).map_err(ApiError::from).unwrap();

        // our session key
        let (challenge_sealing_key, session_sealing_key) = {
            let key = if let Some(hex_key) = &config.cookie_session_key_hex {
                crypto::hex::decode(hex_key).expect("invalid session cookie key")
            } else {
                log::error!("WARNING GENERATING RANDOM SESSION KEY");
                crypto::random::random_cookie_session_key_bytes()
            };
            (
                ScopedSealingKey::new(key.clone(), "CHALLENGE_SEALING").expect("invalid master session key"),
                ScopedSealingKey::new(key, "SESSION_SEALING").expect("invalid master session key"),
            )
        };

        State {
            config: config.clone(),
            enclave_connection_pool: pool,
            kms_client,
            hmac_client,
            workos_client,
            twilio_client,
            sendgrid_client,
            db_pool,
            challenge_sealing_key,
            session_sealing_key,
        }
    };

    log::info!("starting server on port {}", config.port);

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
            .limit(32_768)
            // accept any content type
            .content_type(|_| true)
            // use custom error handler
            .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidJsonBody(err)));

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap(
                sentry_actix::Sentry::builder()
                    .capture_server_errors(true)
                    .start_transaction(true)
                    .finish(),
            )
            .wrap(actix_web::middleware::NormalizePath::trim())
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(cors)
            .app_data(json_cfg)
            .wrap_api()
            .configure(index::routes)
            .service(
                web::scope("/private")
                    .service(client::init::handler)
                    .service(private::cleanup::post),
            )
            .service(identify::routes())
            .service(tenant::routes())
            .service(onboarding::routes())
            .service(user::routes())
            .service(tenant::workos::routes())
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
