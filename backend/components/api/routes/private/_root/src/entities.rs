use actix_web::{get, web};
use api_core::auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard};
use api_core::errors::ApiResult;
use api_core::types::{JsonApiResponse, ResponseData};
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::State;
use db::models::scoped_vault::{ScopedVault, ScopedVaultIdentifier};

#[get("/private/entities/{fp_id}")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    fp_id: FpIdPath,
) -> JsonApiResponse<api_wire_types::SuperAdminEntity> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let fp_id = fp_id.into_inner();

    let sv = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Verify the tenant_id is real
            let id = ScopedVaultIdentifier::SuperAdminView { fp_id: &fp_id };
            let sv = ScopedVault::get(conn, id)?;
            Ok(sv)
        })
        .await??;

    ResponseData::ok(api_wire_types::SuperAdminEntity::from_db(sv)).json()
}
