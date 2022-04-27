use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web
};

use db::models::tenant_api_keys::PartialTenantApiKey;
use crate::response::success::ApiResponseData;
use crypto::random::gen_random_alphanumeric_code;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantApiInitResponse {
    tenant_pub_key: String,
    tenant_key_name: String,
    tenant_secret_key: String,
    tenant_id: String
}

#[post("/tenant/{tenant_id}/api-key/init/{key_name}")]
async fn handler(
    state: web::Data<State>, 
    path: web::Path<(String, String)> ,
) ->  Result<ApiResponseData<TenantApiInitResponse>, ApiError> {
    let (tenant_id, key_name) = path.into_inner();

    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34)); 

    let tenant_api_key =
        db::tenant::api_init(&state.db_pool, PartialTenantApiKey {
            tenant_id: tenant_id,
            name: key_name
        }, api_key.clone()).await?;

    Ok(ApiResponseData{
        data: TenantApiInitResponse {
            tenant_pub_key: tenant_api_key.api_key_id,
            tenant_key_name: tenant_api_key.name,
            tenant_id: tenant_api_key.tenant_id,
            tenant_secret_key: api_key
        }
    })
}