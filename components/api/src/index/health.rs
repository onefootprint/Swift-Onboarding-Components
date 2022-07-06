use crate::errors::ApiError;
use crate::State;
use enclave_proxy::{EnclavePayload, RpcPayload};
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation]
#[tracing::instrument(name = "health", skip(state))]
#[get("/health")]
async fn handler(state: web::Data<State>) -> Result<String, ApiError> {
    let before_enclave = chrono::Utc::now().timestamp_millis();
    {
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

#[api_v2_operation]
#[tracing::instrument(name = "panic")]
#[get("/panic")]
async fn panic_handler() -> &'static str {
    tracing::debug!("about to panic");
    panic!("at the disco");
}

#[api_v2_operation]
#[tracing::instrument(name = "fail")]
#[get("/fail")]
async fn fail_handler() -> Result<&'static str, ApiError> {
    tracing::debug!("about to fail");
    Err(ApiError::NotImplemented)
}
