
use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use aws_sdk_kms::model::DataKeyPairSpec;
use crypto::{b64::Base64Data};

#[derive(Debug, Clone, serde::Deserialize)]
struct EncryptRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DataEncryptionResponse {
    sealed_data: String,
    public_key: Base64Data,
    sealed_private_key: Base64Data,
}

#[post("/encrypt")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<EncryptRequest>,
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