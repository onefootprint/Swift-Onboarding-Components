use actix_web::{
    get, middleware::Logger, post, web, patch, App, HttpRequest, HttpResponse, HttpServer, Responder,
    ResponseError
};
use actix_web_opentelemetry::RequestMetrics;
use aws_sdk_kms::{
    error::{GenerateDataKeyPairWithoutPlaintextError, GenerateDataKeyWithoutPlaintextError},
    model::DataKeyPairSpec,
    types::SdkError as KmsSdkError,
};
use aws_sdk_pinpointsmsvoicev2::{
    error::SendTextMessageError,
    types::SdkError as SmsSdkError,
};
use aws_sdk_pinpointemail::{
    model::{
        Body as EmailBody,
        Content as EmailStringContent,
        Destination as EmailDestination,
        Message as EmailMessage,
        EmailContent,
    },
    error::SendEmailError,
    types::SdkError as EmailSdkError,
};
use config::Config;
use crypto::{b64::Base64Data, seal::EciesP256Sha256AesGcmSealed, sha256, random::gen_random_alphanumeric_code, hex::ToHex};
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
use uuid::Uuid;
use db::models::{tenants::NewTenant, tenant_api_keys::PartialTenantApiKey, users::{NewUser, UpdateUser}, temp_tenant_user_tokens::{PartialTempTenantUserToken}};
use db::models::types::{ChallengeKind, Status};
use db::{DbError, DbPool};


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

#[tracing::instrument(name = "test", skip(state))]
#[get("/test")]
async fn test(state: web::Data<State>) -> Result<impl Responder, ApiError> {
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

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("not implemented error")]
    NotImplementedError,
    #[error("no_phone_number_for_user")]
    NoPhoneNumberForUser,
    #[error("Data {0:?} not set for user")]
    DataNotSetForUser(ChallengeKind),
    #[error("kms.datakeypair.generate {0}")]
    KmsKeyPair(#[from] KmsSdkError<GenerateDataKeyPairWithoutPlaintextError>),
    #[error("kms.datakey.generate {0}")]
    KmsDataKey(#[from] KmsSdkError<GenerateDataKeyWithoutPlaintextError>),
    #[error("crypto {0}")]
    Crypto(#[from] crypto::Error),
    #[error("enclave_proxy {0}")]
    EnclaveProxy(#[from] enclave_proxy::Error),
    #[error("enclave_conn {0}")]
    EnclaveConnection(#[from] bb8::RunError<enclave_proxy::Error>),
    #[error("enclave {0}")]
    Enclave(#[from] enclave_proxy::EnclaveError),
    #[error("database_result {0}")]
    Database(#[from] DbError),
    #[error("dotenv {0}")]
    Dotenv(#[from] dotenv::Error),
    #[error("send_text_message_error {0}")]
    SendTextMessageError(#[from] SmsSdkError<SendTextMessageError>),
    #[error("send_email_error {0}")]
    SendEmailError(#[from] EmailSdkError<SendEmailError>),
}

impl ResponseError for ApiError {}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub enum UserModificationType {
    Ssn,
    Dob,
    PhoneNumber,
    EmailAddress,
    StreetAddress,
    City,
    State,
    FirstName,
    LastName,
    ZipCode
}

#[derive(Debug, Clone, serde::Deserialize)]
struct DataRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
struct CreateChallengeRequest {
    kind: ChallengeKind,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DataEncryptionResponse {
    sealed_data: String,
    public_key: Base64Data,
    sealed_private_key: Base64Data,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantUserAuthResponse {
    tenant_user_id: String,
    tenant_user_auth_token: String
}
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantAuthResponse {
    tenant_id: String,
    tenant_name: String,
}
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantApiInitResponse {
    tenant_pub_key: String,
    tenant_key_name: String,
    tenant_secret_key: String,
    tenant_id: String
}

#[derive(Debug, Clone, serde::Deserialize)]
struct UserPatchRequest {
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    first_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    last_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    dob: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    ssn: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    street_address: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    city: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    state: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    email: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    phone_number: Option<Option<String>>
} 

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserPatchResponse {
    tenant_user_id: String
}

// TODO -- this endpoint will be private in prod
#[post("/tenant/init/{name}")]
async fn tenant_init(
    state: web::Data<State>, 
    path: web::Path<String> ,
) ->  actix_web::Result<impl Responder, ApiError> {
    let tenant = 
        db::tenant_init(&state.db_pool, NewTenant {
            name: path.into_inner(),
        }).await?;

    Ok(web::Json(TenantAuthResponse {
        tenant_id: tenant.id,
        tenant_name: tenant.name
    }))
}

#[post("/tenant/{tenant_id}/api-key/init/{key_name}")]
async fn tenant_api_init(
    state: web::Data<State>, 
    path: web::Path<(String, String)> ,
) ->  actix_web::Result<impl Responder, ApiError> {
    let (tenant_id, key_name) = path.into_inner();

    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34)); 

    let tenant_api_key =
        db::tenant_api_init(&state.db_pool, PartialTenantApiKey {
            tenant_id: tenant_id,
            name: key_name
        }, api_key.clone()).await?;

    Ok(web::Json(TenantApiInitResponse {
        tenant_pub_key: tenant_api_key.api_key_id,
        tenant_key_name: tenant_api_key.name,
        tenant_id: tenant_api_key.tenant_id,
        tenant_secret_key: api_key
    }))
}

#[patch("/tenant/authz/{tenant_user_token}/user/{tenant_user_id}/update")]
async fn user_update_field(
    state: web::Data<State>, 
    path: web::Path<(String, String)>,
    request: web::Json<UserPatchRequest>
) ->  actix_web::Result<impl Responder, ApiError> {
    
    let (tenant_user_token, tenant_user_id) = path.into_inner();

    // look up real uuid from tenant scoped uuid
    let user = db::tenant_user_lookup(
        &state.db_pool, tenant_user_token, tenant_user_id
    ).await?;


    let seal = |val: Option<Option<String>>| {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => {
                Some(crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
                    &user.public_key,
                    s.as_str().as_bytes().to_vec(),
                ).ok()?.to_vec().ok()?)
            }
        }
    };

    fn hash(val: Option<Option<String>>) -> Option<Vec<u8>> {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => {
                Some(sha256(s.as_bytes()).to_vec())
            }
        }
    }
    
    let user_update = UpdateUser {
        id: user.id,
        e_first_name: seal(request.first_name.clone()),
        e_last_name: seal(request.last_name.clone()),
        e_dob: seal(request.dob.clone()),
        e_ssn: seal(request.ssn.clone()),
        sh_ssn: hash(request.ssn.clone()),
        e_street_address: seal(request.street_address.clone()),
        e_city: seal(request.city.clone()),
        e_state: seal(request.state.clone()),
        e_email: seal(request.email.clone()),
        is_email_verified: None,
        sh_email: hash(request.email.clone()),
        e_phone_number: seal(request.phone_number.clone()),
        is_phone_number_verified: None,
        sh_phone_number: hash(request.phone_number.clone()),
        id_verified: Status::Processing
    };

    let size = db::user_vault_update(&state.db_pool, user_update).await?;

    Ok(format!("Succesful update: total update size {}", size))

}

#[post("/tenant/authz/{tenant_pub_key}/user/init")]
async fn user_init(
    state: web::Data<State>, 
    path: web::Path<String>
) ->  actix_web::Result<impl Responder, ApiError> {

    let tenant_pub_key = path.into_inner();

    let tenant_api_key = db::tenant_pub_auth_check(&state.db_pool, tenant_pub_key).await?;

    // TODO, add email & phone number to request & check against existing entries

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
        crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)?;

    let _pk = crypto::hex::encode(&ec_pk_uncompressed);
    
    let user = NewUser {
        e_private_key: new_key_pair
                .private_key_ciphertext_blob
                .unwrap()
                .into_inner(),
        public_key: ec_pk_uncompressed,
        id_verified: Status::Incomplete,
    };

    let temp_token = "vtok_".to_owned() + &gen_random_alphanumeric_code(34);

    let partial_temp_tenant_token = PartialTempTenantUserToken {
        tenant_id: tenant_api_key.tenant_id,
        h_token: sha256(&temp_token.as_bytes()).encode_hex()
    };

    let uuid = db::user_vault_init(&state.db_pool, user, partial_temp_tenant_token).await?;

    Ok(web::Json(TenantUserAuthResponse{
        tenant_user_id: uuid,
        tenant_user_auth_token: temp_token
    }))
}

#[post("/user/{user_id}/challenge")]
async fn create_challenge(
    state: web::Data<State>,
    path: web::Path<String>,
    request: web::Json<CreateChallengeRequest>,
) -> Result<impl Responder, ApiError> {
    
    let user_id = path.into_inner();
    tracing::info!("in challenge with user_id {}", user_id.clone());
    // TODO 404 if the user isn't found
    let user = db::user_get(&state.db_pool, user_id.clone()).await?;

    db::expire_old_challenges(&state.db_pool, user_id.clone(), request.kind).await?;
  
    let sh_data = match request.kind {
        ChallengeKind::Email => user.sh_email,
        ChallengeKind::PhoneNumber => user.sh_phone_number,
    };
    
    let sh_data = match sh_data {
        Some(sh_data) => sh_data,
        None => return Err(ApiError::DataNotSetForUser(request.kind)),
    };

    let (challenge, code) =
        db::create_challenge(&state.db_pool, user_id.clone(), sh_data, request.kind).await?;

    // We may want to end up doing this asynchronously - these can be latent operations
    match request.kind {
        ChallengeKind::Email => {
            let body_text = EmailStringContent::builder().data(format!("Hello from footprint!\n\nYour Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code)).build();
            let body_html = EmailStringContent::builder().data(format!("<h1>Hello from footprint!</h1><br><br>Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.<br><br>@onefootprint.com #{}", code, code)).build();
            let body = EmailBody::builder()
                .text(body_text)
                .html(body_html)
                .build();
            let message = EmailMessage::builder()
                .subject(EmailStringContent::builder().data("Hello from Footprint!").build())
                .body(body)
                .build();
            let content = EmailContent::builder()
                .simple(message)
                .build();
            let output = state.email_client.send_email()
                // TODO decrypt email
                .destination(EmailDestination::builder().to_addresses("TODO").build())
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await
                .map_err(ApiError::from)?;
            println!("output from sending email message {:?}", output)
        },
        ChallengeKind::PhoneNumber => {
            let output = state.sms_client.send_text_message()
                // TODO decrypt phone number
                .destination_phone_number("TODO")
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            println!("output from sending text {:?}", output)
        },
    };

    Ok(web::Json(challenge.id))
}

#[derive(Debug, Clone, serde::Deserialize)]
struct ChallengeVerificationRequest {
    code: String,
}

#[post("/user/{user_id}/challenge/{challenge_id}/verify")]
async fn verify_challenge(
    state: web::Data<State>,
    path: web::Path<(String, Uuid)>,
    request: web::Json<ChallengeVerificationRequest>,
) -> Result<impl Responder, ApiError> {
    let (user_id, challenge_id) = path.into_inner();
    tracing::info!(
        "in challenge verification with user_id {} challenge_id {}",
        user_id.clone(),
        challenge_id
    );

    let request = request;
    db::verify_challenge(&state.db_pool, challenge_id, user_id, request.into_inner().code)
        .await?;
    // TODO yield auth token if chalenge is successfully verified
    Ok(web::Json("verified! one day this will have an auth token")) 
}

#[post("/encrypt")]
async fn encrypt(
    state: web::Data<State>,
    request: web::Json<DataRequest>,
) -> Result<impl Responder, ApiError> {
    tracing::info!("in encrypt");

    let new_key_pair = state
        .kms_client
        .generate_data_key_pair_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_pair_spec(DataKeyPairSpec::EccNistP256)
        .send()
        .await?;

    let der_public_key = new_key_pair.public_key.unwrap().into_inner();
    let ec_pk_uncompressed =
        crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)?;

    let pk = crypto::hex::encode(&ec_pk_uncompressed);
    tracing::info!(%pk, "got public key");

    let sealed = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        &ec_pk_uncompressed,
        request.data.as_str().as_bytes().to_vec(),
    )?;

    Ok(web::Json(DataEncryptionResponse {
        sealed_data: sealed.to_string()?,
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
) -> Result<impl Responder, ApiError> {
    tracing::info!("in decrypt");

    let req = request.into_inner();
    let mut conn = state.enclave_connection_pool.get().await?;
    let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecrypt {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_data: EciesP256Sha256AesGcmSealed::from_str(req.sealed_data.as_str())?,
        sealed_key: req.sealed_private_key.0,
        transform: enclave_proxy::DataTransform::Identity,
    }));

    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
    tracing::info!("got response");
    let response = FnDecryption::try_from(response)?;
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
) -> Result<impl Responder, ApiError> {
    tracing::info!("in sign");

    let new_data_key = state
        .kms_client
        .generate_data_key_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_spec(aws_sdk_kms::model::DataKeySpec::Aes256)
        .send()
        .await?;

    let sealed_key = new_data_key.ciphertext_blob.unwrap().into_inner();

    let mut conn = state.enclave_connection_pool.get().await?;

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
    let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
    tracing::info!("got response");

    let response = HmacSignature::try_from(response)?;

    Ok(web::Json(DataEnvelopeSignatureResponse {
        hmac_sha256_signature: Base64Data(response.signature),
        sealed_key: Base64Data(sealed_key),
    }))
}

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
            .service(test)
            .service(encrypt)
            .service(decrypt)
            .service(sign)
            .service(user_init)
            .service(tenant_init)
            .service(tenant_api_init)
            .service(user_update_field)
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
