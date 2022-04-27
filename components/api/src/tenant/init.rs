use crate::errors::ApiError;
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
    let tenant = 
        db::tenant::init(&state.db_pool, NewTenant {
            name: path.into_inner(),
        }).await?;

    Ok(ApiResponseData {
        data: TenantAuthResponse {
            tenant_id: tenant.id,
            tenant_name: tenant.name
        }
    })
}