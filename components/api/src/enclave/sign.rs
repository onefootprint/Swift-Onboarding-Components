use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use crypto::b64::Base64Data;
use enclave_proxy::{EnvelopeHmacSign, HmacSignature, KmsCredentials, RpcPayload};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
struct SignRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct DataEnvelopeSignatureResponse {
    hmac_sha256_signature: String,
    sealed_key: String,
}

#[api_v2_operation]
#[post("/sign")]
async fn handler(
    state: web::Data<State>,
    request: Json<SignRequest>,
) -> Result<Json<ApiResponseData<DataEnvelopeSignatureResponse>>, ApiError> {
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

    Ok(Json(ApiResponseData {
        data: DataEnvelopeSignatureResponse {
            hmac_sha256_signature: Base64Data(response.signature).to_string(),
            sealed_key: Base64Data(sealed_key).to_string(),
        },
    }))
}
