use crate::errors::ApiError;
use crate::response::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use aws_sdk_kms::model::DataKeyPairSpec;
use crypto::b64::Base64Data;

#[derive(Debug, Apiv2Schema, Clone, serde::Serialize, serde::Deserialize)]
struct EncryptRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct DataEncryptionResponse {
    sealed_data: String,
    public_key: String,
    sealed_private_key: String,
}

#[api_v2_operation]
#[post("/encrypt")]
async fn handler(
    state: web::Data<State>,
    request: Json<EncryptRequest>,
) -> Result<Json<ApiResponseData<DataEncryptionResponse>>, ApiError> {
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

    Ok(Json(ApiResponseData {
        data: DataEncryptionResponse {
            sealed_data: sealed.to_string()?,
            public_key: Base64Data(ec_pk_uncompressed).to_string(),
            sealed_private_key: Base64Data(
                new_key_pair
                    .private_key_ciphertext_blob
                    .unwrap()
                    .into_inner(),
            )
            .to_string(),
        },
    }))
}
