use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use db::models::{
    tenants::NewTenant,
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