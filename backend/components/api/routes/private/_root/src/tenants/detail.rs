use actix_web::{get, web};
use api_core::{
    auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    types::{JsonApiResponse, ResponseData},
    utils::db2api::DbToApi,
    State,
};
use db::models::tenant::Tenant;
use newtypes::TenantId;

#[get("/private/tenants/{id}")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    id: web::Path<TenantId>,
) -> JsonApiResponse<api_wire_types::PrivateTenantDetail> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let id = id.into_inner();

    let tenant = state
        .db_pool
        .db_query(move |conn| Tenant::private_get(conn, &id))
        .await?;

    let response = api_wire_types::PrivateTenantDetail::from_db(tenant);
    ResponseData::ok(response).json()
}
