use crate::errors::ApiError;
use crate::State;

use enclave_proxy::{
    EnvelopeDecrypt, FnDecryption, KmsCredentials, RpcPayload, DataTransform,
};
use crypto::{seal::EciesP256Sha256AesGcmSealed};

pub async fn decrypt(state: &actix_web::web::Data<State>, sealed_data: &Vec<u8>, sealed_key: Vec<u8>, transform: DataTransform) -> Result<Vec<u8>, ApiError> {
    let mut conn = state.enclave_connection_pool.get().await?;

    let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecrypt {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(sealed_data)?,
        sealed_key: sealed_key,
        transform: transform,
    }));
    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
    tracing::info!("got response");
    let response = FnDecryption::try_from(response)?;
    Ok(response.data)
}