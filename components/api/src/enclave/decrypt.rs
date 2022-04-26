use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use enclave_proxy::{
    EnvelopeDecrypt, FnDecryption, KmsCredentials, RpcPayload,
};
use crypto::{b64::Base64Data, seal::EciesP256Sha256AesGcmSealed};

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