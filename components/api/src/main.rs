use actix_web::{
    get, middleware::Logger, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
    ResponseError,
};
use actix_web_opentelemetry::RequestMetrics;
use aws_sdk_kms::{
    error::{GenerateDataKeyPairWithoutPlaintextError, GenerateDataKeyWithoutPlaintextError},
    model::DataKeyPairSpec,
    types::SdkError,
};
use config::Config;
use crypto::{b64::Base64Data, seal::EciesP256Sha256AesGcmSealed};
use db::DbPool;
use enclave_proxy::{
    bb8, pool, EnclavePayload, EnvelopeDecrypt, EnvelopeHmacSign, FnDecryption, HmacSignature,
    KmsCredentials, RpcPayload, StreamManager,
};
use futures_util::TryFutureExt;
use telemetry::TelemetrySpanBuilder;
use tracing_actix_web::TracingLogger;
mod config;
mod telemetry;
use thiserror::Error;

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

#[tracing::instrument(name = "test", skip(state))]
#[get("/test")]
async fn test(state: web::Data<State>) -> impl Responder {
    let mut conn = state.enclave_connection_pool.get().await.unwrap();
    let req = enclave_proxy::RpcRequest::new(RpcPayload::Ping("test".into()));

    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn)
        .await
        .unwrap();

    if let EnclavePayload::Pong(response) = response {
        response
    } else {
        "invalid response".to_string()
    }
}

#[tracing::instrument(name = "log_headers")]
fn log_headers(headers: &Vec<String>) {
    tracing::info!("got headers");
}

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("kms.datakeypair.generate {0}")]
    KmsKeyPair(#[from] SdkError<GenerateDataKeyPairWithoutPlaintextError>),
    #[error("kms.datakey.generate {0}")]
    KmsDataKey(#[from] SdkError<GenerateDataKeyWithoutPlaintextError>),
    #[error("crypto {0}")]
    Crypto(#[from] crypto::Error),
    #[error("enclave_proxy {0}")]
    EnclaveProxy(#[from] enclave_proxy::Error),
    #[error("enclave_conn {0}")]
    EnclaveConnection(#[from] bb8::RunError<enclave_proxy::Error>),
    #[error("enclave {0}")]
    Enclave(#[from] enclave_proxy::EnclaveError),
    #[error("db error {0}")]
    Db(String),
}

impl ResponseError for ApiError {}

#[derive(Debug, Clone, serde::Deserialize)]
struct DataRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DataEncryptionResponse {
    sealed_data: String,
    public_key: Base64Data,
    sealed_private_key: Base64Data,
}

#[post("/encrypt")]
async fn encrypt(
    state: web::Data<State>,
    request: web::Json<DataRequest>,
) -> actix_web::Result<impl Responder> {
    tracing::info!("in encrypt");

    let new_key_pair = state
        .kms_client
        .generate_data_key_pair_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_pair_spec(DataKeyPairSpec::EccNistP256)
        .send()
        .map_err(ApiError::from)
        .await?;

    let der_public_key = new_key_pair.public_key.unwrap().into_inner();
    let ec_pk_uncompressed =
        crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)
            .map_err(ApiError::from)?;

    let pk = crypto::hex::encode(&ec_pk_uncompressed);
    tracing::info!(%pk, "got public key");

    let sealed = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        &ec_pk_uncompressed,
        request.data.as_str().as_bytes().to_vec(),
    )
    .map_err(ApiError::from)?;

    Ok(web::Json(DataEncryptionResponse {
        sealed_data: sealed.to_string().map_err(ApiError::from)?,
        public_key: Base64Data(ec_pk_uncompressed),
        sealed_private_key: Base64Data(
            new_key_pair
                .private_key_ciphertext_blob
                .unwrap()
                .into_inner(),
        ),
    }))
}

#[derive(Debug, Clone, serde::Deserialize)]
struct DataDecryptionRequest {
    sealed_data: String,
    sealed_private_key: Base64Data,
}

#[post("/decrypt")]
async fn decrypt(
    state: web::Data<State>,
    request: web::Json<DataDecryptionRequest>,
) -> actix_web::Result<impl Responder> {
    tracing::info!("in decrypt");

    let req = request.into_inner();
    let mut conn = state
        .enclave_connection_pool
        .get()
        .await
        .map_err(ApiError::from)?;
    let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecrypt {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_data: EciesP256Sha256AesGcmSealed::from_str(req.sealed_data.as_str())
            .map_err(ApiError::from)?,
        sealed_key: req.sealed_private_key.0,
        transform: enclave_proxy::DataTransform::Identity,
    }));

    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn)
        .await
        .map_err(ApiError::from)?;
    tracing::info!("got response");
    let response = FnDecryption::try_from(response).map_err(ApiError::from)?;
    Ok(std::str::from_utf8(&response.data).unwrap().to_string())
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DataEnvelopeSignatureResponse {
    hmac_sha256_signature: Base64Data,
    sealed_key: Base64Data,
}

#[post("/sign")]
async fn sign(
    state: web::Data<State>,
    request: web::Json<DataRequest>,
) -> actix_web::Result<impl Responder> {
    tracing::info!("in sign");

    let new_data_key = state
        .kms_client
        .generate_data_key_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_spec(aws_sdk_kms::model::DataKeySpec::Aes256)
        .send()
        .map_err(ApiError::from)
        .await?;

    let sealed_key = new_data_key.ciphertext_blob.unwrap().into_inner();

    let mut conn = state
        .enclave_connection_pool
        .get()
        .await
        .map_err(ApiError::from)?;

    let req = enclave_proxy::RpcRequest::new(RpcPayload::HmacSign(EnvelopeHmacSign {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_key: sealed_key.clone(),
        data: request.data.as_bytes().to_vec(),
        scope: b"test_scope".to_vec(),
    }));

    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn)
        .await
        .map_err(ApiError::from)?;
    tracing::info!("got response");

    let response = HmacSignature::try_from(response).map_err(ApiError::from)?;

    Ok(web::Json(DataEnvelopeSignatureResponse {
        hmac_sha256_signature: Base64Data(response.signature),
        sealed_key: Base64Data(sealed_key),
    }))
}

#[derive(Clone)]
pub struct State {
    config: Config,
    kms_client: aws_sdk_kms::Client,
    enclave_connection_pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
    db_pool: DbPool,
}

#[tracing::instrument(name = "test_db", skip(state))]
#[get("/test_db")]
async fn test_db(state: web::Data<State>) -> actix_web::Result<impl Responder> {
    let tenant = db::test(&state.db_pool)
        .await
        .map_err(|e| ApiError::Db(format!("{:?}", e)))?;
    Ok(format!("got tenant id {}", tenant.id.to_string()))
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
        let kms_client = aws_sdk_kms::Client::new(&shared_config);

        // run migrations
        let _ = db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url).unwrap();

        State {
            config: config.clone(),
            enclave_connection_pool: pool,
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
            .service(test)
            .service(encrypt)
            .service(decrypt)
            .service(test_db)
            .service(sign)
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
