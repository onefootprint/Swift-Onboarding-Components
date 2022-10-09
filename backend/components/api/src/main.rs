use actix_web::{middleware::Logger, App, HttpServer, ResponseError};
use config::Config;
use crypto::aead::ScopedSealingKey;
use db::DbPool;
use enclave_client::EnclaveClient;

use idv::idology::client::IdologyClient;
use signed_hash::SignedHashClient;
use std::{borrow::Cow, sync::Arc};
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;
use utils::email::SendgridClient;
use workos::{ApiKey, WorkOs};
mod config;
mod signed_hash;
mod telemetry;
mod users;

mod auth;
mod enclave_client;
mod errors;
mod hosted;
mod index;
mod org;
mod private;
mod s3;
mod types;
mod utils;
mod decision;

use crate::{errors::ApiError, utils::twilio::TwilioClient};
use paperclip::actix::{web, OpenApiExt};

#[derive(Clone)]
pub struct State {
    config: Config,
    hmac_client: SignedHashClient,
    workos_client: Arc<WorkOs>,
    twilio_client: TwilioClient,
    sendgrid_client: SendgridClient,
    db_pool: DbPool,
    enclave_client: EnclaveClient,
    challenge_sealing_key: ScopedSealingKey,
    session_sealing_key: ScopedSealingKey,
    idology_client: IdologyClient,
    s3_client: s3::S3Client,
}

lazy_static::lazy_static! {
    pub static ref GIT_HASH:&'static str = env!("GIT_HASH");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let mut config = config::Config::load_from_env().expect("failed to load config");

    // telemetry
    let _controller = telemetry::init(&config).expect("failed to init telemetry layers");

    // sentry
    let _guard = if let Some(env) = config.service_config.environment.clone() {
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
        let enclave_client = EnclaveClient::new(config.clone()).await;

        let shared_config = aws_config::from_env().load().await;
        let s3_client = s3::S3Client {
            client: aws_sdk_s3::Client::new(&shared_config),
        };
        s3_client
            .check_bucket_access_on_server_start(vec![config.document_s3_bucket.clone()])
            .await
            .expect("S3 initialization failed!");
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = SignedHashClient {
            client: kms_client,
            key_id: config.signing_root_key_id.clone(),
        };

        let workos_client = WorkOs::new(&ApiKey::from(config.workos_api_key.as_str()));

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
            config.sendgrid_magic_link_template_id.clone(),
        );

        let idology_client = IdologyClient::new(
            config.idology_config.username.clone().into(),
            config.idology_config.password.clone().into(),
        )
        .unwrap();

        // let out = hmac_client
        //     .signed_hash(&vec![0xde, 0xad, 0xbe, 0xef])
        //     .await
        //     .unwrap();
        // dbg!(crypto::hex::encode(&out));

        // run migrations
        db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url).map_err(ApiError::from).unwrap();

        // our session key
        let (challenge_sealing_key, session_sealing_key) = {
            // take here removes it from the config
            let key = if let Some(hex_key) = config.cookie_session_key_hex.take() {
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
            enclave_client,
            hmac_client,
            workos_client: Arc::new(workos_client),
            twilio_client,
            sendgrid_client,
            db_pool,
            challenge_sealing_key,
            session_sealing_key,
            idology_client,
            s3_client,
        }
    };

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
            .configure(index::routes)
            .service(private::routes())
            .service(org::routes())
            .service(hosted::routes())
            .service(users::routes())
            .with_json_spec_at("/docs-spec")
            .with_json_spec_v3_at("/docs-spec-v3")
            .with_swagger_ui_at("/docs-ui")
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
