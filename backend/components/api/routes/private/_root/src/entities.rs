use actix_web::{get, web};
use api_core::{
    auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    errors::ApiResult,
    telemetry::RootSpan,
    types::{JsonApiResponse, ResponseData},
    utils::db2api::DbToApi,
    State,
};
use db::models::scoped_vault::{ScopedVault, ScopedVaultIdentifier};

#[get("/private/entities/{id}")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    id: web::Path<String>,
    root_span: RootSpan,
) -> JsonApiResponse<api_wire_types::SuperAdminEntity> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let id = id.into_inner();

    let sv = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let id = ScopedVaultIdentifier::SuperAdminView { identifier: &id };
            let sv = ScopedVault::get(conn, id)?;
            Ok(sv)
        })
        .await?;
    root_span.record("fp_id", sv.fp_id.to_string());

    ResponseData::ok(api_wire_types::SuperAdminEntity::from_db(sv)).json()
}
