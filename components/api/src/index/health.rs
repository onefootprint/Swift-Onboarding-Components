use crate::errors::ApiError;
use crate::State;
use actix_web::{
    get, web, Responder,
};
use enclave_proxy::{EnclavePayload, RpcPayload};

#[tracing::instrument(name = "health", skip(state))]
#[get("/health")]
async fn handler(state: web::Data<State>) -> Result<impl Responder, ApiError> {
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