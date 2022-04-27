use crate::errors::ApiError;
use crate::State;

use crypto::seal::EciesP256Sha256AesGcmSealed;
use enclave_proxy::{DataTransform, EnvelopeDecrypt, FnDecryption, KmsCredentials, RpcPayload};
use aws_sdk_kms::model::DataKeyPairSpec;


pub async fn gen_keypair(state: &actix_web::web::Data<State>) -> Result<(Vec<u8>, Vec<u8>), ApiError>{

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

    let _pk = crypto::hex::encode(&ec_pk_uncompressed);

    let e_priv_key = new_key_pair
        .private_key_ciphertext_blob
        .unwrap()
        .into_inner();

    Ok((ec_pk_uncompressed, e_priv_key))

}
pub async fn decrypt_bytes(
    state: &actix_web::web::Data<State>,
    sealed_data: &[u8],
    sealed_key: Vec<u8>,
    transform: DataTransform,
) -> Result<Vec<u8>, ApiError> {
    let sealed_data = EciesP256Sha256AesGcmSealed::from_bytes(sealed_data)?;
    decrypt(state, sealed_data, sealed_key, transform).await
}

pub async fn decrypt_string(
    state: &actix_web::web::Data<State>,
    sealed_data: &str,
    sealed_key: Vec<u8>,
    transform: DataTransform,
) -> Result<Vec<u8>, ApiError> {
    let sealed_data = EciesP256Sha256AesGcmSealed::from_str(sealed_data)?;
    decrypt(state, sealed_data, sealed_key, transform).await
}

pub async fn decrypt(
    state: &actix_web::web::Data<State>,
    sealed_data: EciesP256Sha256AesGcmSealed,
    sealed_key: Vec<u8>,
    transform: DataTransform,
) -> Result<Vec<u8>, ApiError> {
    let mut conn = state.enclave_connection_pool.get().await?;

    let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecrypt {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_data,
        sealed_key,
        transform,
    }));
    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
    tracing::info!("got response");
    let response = FnDecryption::try_from(response)?;
    Ok(response.data)
}
