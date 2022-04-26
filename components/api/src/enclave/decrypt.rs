use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use enclave_proxy::DataTransform;
use crypto::b64::Base64Data;

#[derive(Debug, Clone, serde::Deserialize)]
struct DataDecryptionRequest {
    sealed_data: String,
    sealed_private_key: Base64Data,
}

#[post("/decrypt")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<DataDecryptionRequest>,
) -> Result<impl Responder, ApiError> {
    tracing::info!("in decrypt");
    let req = request.into_inner();

    let decrypted_result = super::lib::decrypt(&state, &req.sealed_data.as_bytes().to_vec(), req.sealed_private_key.0, DataTransform::Identity).await?;
    Ok(std::str::from_utf8(&decrypted_result).unwrap().to_string())
}