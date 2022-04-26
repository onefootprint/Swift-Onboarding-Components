use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use db::models::{
    tenants::NewTenant,
    tenant_api_keys::PartialTenantApiKey,
};
use crypto::random::gen_random_alphanumeric_code;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantAuthResponse {
    tenant_id: String,
    tenant_name: String,
}

// TODO -- this endpoint will be private in prod
#[post("/tenant/init/{name}")]
async fn init(
    state: web::Data<State>, 
    path: web::Path<String> ,
) ->  actix_web::Result<impl Responder, ApiError> {
    let tenant = 
        db::tenant::init(&state.db_pool, NewTenant {
            name: path.into_inner(),
        }).await?;

    Ok(web::Json(TenantAuthResponse {
        tenant_id: tenant.id,
        tenant_name: tenant.name
    }))
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantApiInitResponse {
    tenant_pub_key: String,
    tenant_key_name: String,
    tenant_secret_key: String,
    tenant_id: String
}

#[post("/tenant/{tenant_id}/api-key/init/{key_name}")]
async fn api_init(
    state: web::Data<State>, 
    path: web::Path<(String, String)> ,
) ->  actix_web::Result<impl Responder, ApiError> {
    let (tenant_id, key_name) = path.into_inner();

    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34)); 

    let tenant_api_key =
        db::tenant::api_init(&state.db_pool, PartialTenantApiKey {
            tenant_id: tenant_id,
            name: key_name
        }, api_key.clone()).await?;

    Ok(web::Json(TenantApiInitResponse {
        tenant_pub_key: tenant_api_key.api_key_id,
        tenant_key_name: tenant_api_key.name,
        tenant_id: tenant_api_key.tenant_id,
        tenant_secret_key: api_key
    }))
}