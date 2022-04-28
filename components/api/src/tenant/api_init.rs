use crate::State;
use crate::{errors::ApiError, response::success::ApiResponseData};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use crypto::random::gen_random_alphanumeric_code;
use db::models::tenant_api_keys::PartialTenantApiKey;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct TenantApiInitResponse {
    tenant_pub_key: String,
    tenant_key_name: String,
    tenant_secret_key: String,
    tenant_id: String,
}

#[api_v2_operation]
#[post("/tenant/{tenant_id}/api-key/init/{key_name}")]
async fn handler(
    state: web::Data<State>,
    path: web::Path<(String, String)>,
) -> Result<Json<ApiResponseData<TenantApiInitResponse>>, ApiError> {
    let (tenant_id, key_name) = path.into_inner();

    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34));

    let tenant = db::tenant::get_tenant(&state.db_pool, tenant_id.clone()).await?;

    let e_api_key = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        &tenant.public_key,
        api_key.clone().into_bytes(),
    )?;

    let tenant_api_key = db::tenant::api_init(
        &state.db_pool,
        PartialTenantApiKey {
            tenant_id: tenant_id,
            name: key_name,
        },
        api_key.clone(),
        e_api_key.to_vec()?,
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: TenantApiInitResponse {
            tenant_pub_key: tenant_api_key.api_key_id,
            tenant_key_name: tenant_api_key.name,
            tenant_id: tenant_api_key.tenant_id,
            tenant_secret_key: api_key,
        },
    }))
}
