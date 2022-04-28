use crate::{errors::ApiError, response::success::ApiResponseData};
use crate::State;
use enclave_proxy::{EnclavePayload, RpcPayload};
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation]
#[tracing::instrument(name = "health", skip(state))]
#[get("/health")]
async fn handler(state: web::Data<State>) -> Result<ApiResponseData<String>, ApiError> {
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

    Ok(ApiResponseData {
        data: format!("Enclave: got {}\nDB: got tenant {}", enclave_health, db_health)
    })
}
