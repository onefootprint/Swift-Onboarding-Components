use std::str::FromStr;

use crate::errors::ApiError;
use crate::types::success::ApiResponseData;

use crate::State;

use crypto::b64::Base64Data;
use enclave_proxy::DataTransform;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
struct DataDecryptionRequest {
    sealed_data: String,
    sealed_private_key: String,
}

#[api_v2_operation]
#[post("/decrypt")]
async fn handler(
    state: web::Data<State>,
    request: Json<DataDecryptionRequest>,
) -> Result<Json<ApiResponseData<String>>, ApiError> {
    tracing::info!("in decrypt");
    let req = request.into_inner();
    let sealed_private_key =
        Base64Data::from_str(&req.sealed_private_key).map_err(crypto::Error::from)?;

    let decrypted_result = super::lib::decrypt_string(
        &state,
        &req.sealed_data,
        sealed_private_key.0,
        DataTransform::Identity,
    )
    .await?;
    Ok(Json(ApiResponseData {
        data: std::str::from_utf8(&decrypted_result).unwrap().to_string(),
    }))
}
