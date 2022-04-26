use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use aws_sdk_kms::model::DataKeyPairSpec;
use enclave_proxy::{
    EnvelopeDecrypt, EnvelopeHmacSign, FnDecryption, HmacSignature, KmsCredentials, RpcPayload,
};
use crypto::{b64::Base64Data, seal::EciesP256Sha256AesGcmSealed};

#[derive(Debug, Clone, serde::Deserialize)]
struct DataRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DataEncryptionResponse {
    sealed_data: String,
    public_key: Base64Data,
    sealed_private_key: Base64Data,
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