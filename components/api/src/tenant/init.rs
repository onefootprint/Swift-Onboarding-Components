use crate::{errors::ApiError, enclave::lib::gen_keypair};
use crate::response::success::ApiResponseData;
use crate::State;
use actix_web::{
    post, web,
};

use db::models::{
    tenants::{NewTenant},
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TenantAuthResponse {
    tenant_id: String,
    tenant_name: String,
}

// TODO -- this endpoint will be private in prod
#[post("/tenant/init/{name}")]
async fn handler(
    state: web::Data<State>, 
    path: web::Path<String> ,
) ->  actix_web::Result<ApiResponseData<TenantAuthResponse>, ApiError> {

    let (ec_pk_uncompressed, e_priv_key) = gen_keypair(&state).await?;

    let tenant = 
        db::tenant::init(&state.db_pool, NewTenant {
            name: path.into_inner(),
            e_private_key: e_priv_key,
            public_key: ec_pk_uncompressed,
        }).await?;

    Ok(ApiResponseData {
        data: TenantAuthResponse {
            tenant_id: tenant.id,
            tenant_name: tenant.name
        }
    })
}