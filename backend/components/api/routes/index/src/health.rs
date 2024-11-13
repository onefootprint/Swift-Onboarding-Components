use crate::auth::custodian::CustodianAuthContext;
use crate::types::ApiResponse;
use crate::types::StringResponse;
use crate::State;
use actix_web::cookie::time::Instant;
use api_errors::ServerErr;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::SealedVaultBytes;
use paperclip::actix::api_v2_errors;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;
use serde::Deserialize;
use serde::Serialize;

#[api_v2_operation(tags(Private), description = "Returns 200 if the API server is running")]
#[get("/health")]
async fn handler() -> StringResponse {
    // The strategy here is to only measure the health of the API server process, not its dependencies.

    // Be very careful what checks you add to this endpoint. A failed response here will cause the API
    // server process to be restarted, which is usually more harmful than a single dependency
    // being down.
    Ok("ok".to_string())
}

use derive_more::Display;

#[api_v2_errors]
#[derive(Debug, Display)]
pub enum CustomError {
    #[display(fmt = "Custom Error 1")]
    CustomOne,
    #[allow(unused)]
    #[display(fmt = "Custom Error 2")]
    CustomTwo,
}

impl actix_web::ResponseError for CustomError {
    fn status_code(&self) -> reqwest::StatusCode {
        reqwest::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        actix_web::HttpResponse::InternalServerError().body(self.to_string())
    }
}

#[api_v2_operation(tags(Private), description = "Returns health of services running")]
#[tracing::instrument(name = "status2")]
#[get("/status2")]
async fn status2() -> Result<String, CustomError> {
    Err(CustomError::CustomOne)
}

#[api_v2_operation(tags(Private), description = "Returns health of services running")]
#[tracing::instrument(name = "status", skip(state))]
#[get("/status")]
async fn status(state: web::Data<State>) -> StringResponse {
    let context = opentelemetry_api::Context::current();
    state.metrics.get_status_counter.add(&context, 1, &[]);

    let before_enclave: i64 = chrono::Utc::now().timestamp_millis();
    state.enclave_client.pong().await?;
    let after_enclave = chrono::Utc::now().timestamp_millis();

    let before_db = chrono::Utc::now().timestamp_millis();
    state.db_pool.db_query(db::health_check).await?;
    let after_db = chrono::Utc::now().timestamp_millis();

    Ok(format!(
        "Enclave: {}ms\nDB: healthy RT {}ms",
        after_enclave - before_enclave,
        after_db - before_db,
    ))
}

#[api_v2_operation(tags(Private), description = "Performs health check to the RO database")]
#[tracing::instrument(name = "status", skip(state))]
#[get("/ro_status")]
async fn ro_status(state: web::Data<State>) -> StringResponse {
    let before_db = chrono::Utc::now().timestamp_millis();
    db::ro_health_check(&state.config.database_ro_url)?;
    let after_db = chrono::Utc::now().timestamp_millis();

    Ok(format!("RO DB: healthy RT {}ms", after_db - before_db,))
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct EnclaveHealthResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    keypair_gen_ms: Option<i128>,
    decrypt_ms: i128,
}

#[api_v2_operation(tags(Private), description = "Returns enclave health")]
#[tracing::instrument(name = "enclave_health", skip(state))]
#[get("/health/enclave")]
async fn enclave(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
) -> ApiResponse<EnclaveHealthResponse> {
    let now = Instant::now();

    let (pk, sk) = state.enclave_client.generate_sealed_keypair().await?;
    let keypair_gen_ms = Some(now.elapsed().whole_milliseconds());

    let test = newtypes::PiiString::from("test data");
    let sealed = pk.seal_pii(&test)?;

    let seal_time = now.elapsed();

    let unsealed = state.enclave_client.decrypt_to_piistring(&sealed, &sk).await?;

    let unseal_time = now.elapsed();

    Ok(EnclaveHealthResponse {
        success: test == unsealed,
        keypair_gen_ms,
        decrypt_ms: (unseal_time - seal_time).whole_milliseconds(),
    })
}

#[api_v2_operation(description = "Checks health of enclave decrypt operation", tags(Private))]
#[tracing::instrument(name = "enclave_health_decrypt", skip(state))]
#[get("/health/enclave_decrypt")]
async fn enclave_decrypt(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
) -> ApiResponse<EnclaveHealthResponse> {
    let now = Instant::now();

    let test = newtypes::PiiString::from("test data");

    #[allow(clippy::unwrap_used)]
    let sk = EncryptedVaultPrivateKey(crypto::hex::decode("a2616e981800183a186b189f18e1188410181d18d41855186d18971842181f10189c18bd188818b31829184118c9182818946163983018ff187c18801884185c18cf181b18ab1830182d181e189b188e189a183518b61892185b183418e5187e188a18851838184018d518fd18fc189a18a30f18291828188e18641834188d18601828183d18d8184e18e318f5188f18ba184118a0").unwrap());

    #[allow(clippy::unwrap_used)]
    let sealed = SealedVaultBytes(crypto::hex::decode("a46176016365706b98410418b218e2189418ee18fe185c185b18de18f918e418771836188218bc18f818eb18b218da1853001839182c1856185e18a5184e18d118e818c118411828184318dc181e18d918e418b2188b1897189418a201181c183d07185618d2187d17189618b318ec184d181b1851183118491856184c185a131858187f18fd6269768c182f1830185518271882187b18d7186c18a9181d18b518a7616398191883183b188316187f184a1831188d18ae18451831189018f918a6184b1867187e1878186318ac188118ad18fa18f6183f").unwrap());

    let seal_time = now.elapsed();

    let unsealed = state.enclave_client.decrypt_to_piistring(&sealed, &sk).await?;

    let unseal_time = now.elapsed();

    Ok(EnclaveHealthResponse {
        success: test == unsealed,
        keypair_gen_ms: None,
        decrypt_ms: (unseal_time - seal_time).whole_milliseconds(),
    })
}

#[api_v2_operation(tags(Private))]
#[tracing::instrument(name = "fail")]
#[get("/fail")]
async fn fail_handler() -> StringResponse {
    tracing::debug!("about to fail");
    Err(ServerErr("Hit /fail endpoint").into())
}
