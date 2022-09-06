use crate::errors::ApiError;
use crate::types::ApiResponseData;
use crate::State;
use crate::{auth::key_context::custodian::CustodianAuthContext, types::JsonApiResponse};

use actix_web::cookie::time::Instant;
use newtypes::{EncryptedVaultPrivateKey, SealedVaultBytes};
use paperclip::actix::{api_v2_operation, get, web, Apiv2Schema};
use serde::{Deserialize, Serialize};

#[api_v2_operation(
    summary = "/health",
    tags(Private),
    description = "Returns health of services running"
)]
#[tracing::instrument(name = "health", skip(state))]
#[get("/health")]
async fn handler(state: web::Data<State>) -> Result<String, ApiError> {
    let before_enclave = chrono::Utc::now().timestamp_millis();
    let _res = state.enclave_client.pong().await?;
    let after_enclave = chrono::Utc::now().timestamp_millis();

    let before_db = chrono::Utc::now().timestamp_millis();
    db::health_check(&state.db_pool).await?;
    let after_db = chrono::Utc::now().timestamp_millis();

    Ok(format!(
        "Enclave: healthy RT {}ms\nDB: healthy RT {}ms",
        after_enclave - before_enclave,
        after_db - before_db
    ))
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
pub struct EnclaveHealthResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    keypair_gen_ms: Option<i128>,
    decrypt_ms: i128,
}

#[api_v2_operation(
    summary = "/health/enclave",
    tags(Private),
    description = "Returns enclave health"
)]
#[tracing::instrument(name = "enclave_health", skip(state))]
#[get("/health/enclave")]
async fn enclave(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
) -> JsonApiResponse<EnclaveHealthResponse> {
    let now = Instant::now();

    let (pk, sk) = state.enclave_client.generate_sealed_keypair().await?;
    let keypair_gen_ms = Some(now.elapsed().whole_milliseconds());

    let test = newtypes::PiiString::from("test data");
    let sealed = pk.seal_pii(&test)?;

    let seal_time = now.elapsed();

    let unsealed = state
        .enclave_client
        .decrypt_bytes(&sealed, &sk, enclave_proxy::DataTransform::Identity)
        .await?;

    let unseal_time = now.elapsed();

    ApiResponseData::ok(EnclaveHealthResponse {
        success: test == unsealed,
        keypair_gen_ms,
        decrypt_ms: (unseal_time - seal_time).whole_milliseconds(),
    })
    .json()
}

#[api_v2_operation(
    summary = "/health/enclave_decrypt",
    description = "Checks health of enclave decrypt operation",
    tags(Private)
)]
#[tracing::instrument(name = "enclave_health_decrypt", skip(state))]
#[get("/health/enclave_decrypt")]
async fn enclave_decrypt(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
) -> JsonApiResponse<EnclaveHealthResponse> {
    let now = Instant::now();

    let test = newtypes::PiiString::from("test data");

    let sk = EncryptedVaultPrivateKey(crypto::hex::decode("a2616e981800183a186b189f18e1188410181d18d41855186d18971842181f10189c18bd188818b31829184118c9182818946163983018ff187c18801884185c18cf181b18ab1830182d181e189b188e189a183518b61892185b183418e5187e188a18851838184018d518fd18fc189a18a30f18291828188e18641834188d18601828183d18d8184e18e318f5188f18ba184118a0").unwrap());

    let sealed = SealedVaultBytes(crypto::hex::decode("a46176016365706b98410418b218e2189418ee18fe185c185b18de18f918e418771836188218bc18f818eb18b218da1853001839182c1856185e18a5184e18d118e818c118411828184318dc181e18d918e418b2188b1897189418a201181c183d07185618d2187d17189618b318ec184d181b1851183118491856184c185a131858187f18fd6269768c182f1830185518271882187b18d7186c18a9181d18b518a7616398191883183b188316187f184a1831188d18ae18451831189018f918a6184b1867187e1878186318ac188118ad18fa18f6183f").unwrap());

    let seal_time = now.elapsed();

    let unsealed = state
        .enclave_client
        .decrypt_bytes(&sealed, &sk, enclave_proxy::DataTransform::Identity)
        .await?;

    let unseal_time = now.elapsed();

    ApiResponseData::ok(EnclaveHealthResponse {
        success: test == unsealed,
        keypair_gen_ms: None,
        decrypt_ms: (unseal_time - seal_time).whole_milliseconds(),
    })
    .json()
}

#[api_v2_operation(summary = "/panic", tags(Private))]
#[tracing::instrument(name = "panic")]
#[get("/panic")]
async fn panic_handler(_: CustodianAuthContext) -> &'static str {
    tracing::debug!("about to panic");
    panic!("at the disco");
}

#[api_v2_operation(summary = "/fail", tags(Private))]
#[tracing::instrument(name = "fail")]
#[get("/fail")]
async fn fail_handler() -> Result<&'static str, ApiError> {
    tracing::debug!("about to fail");
    Err(ApiError::NotImplemented)
}
