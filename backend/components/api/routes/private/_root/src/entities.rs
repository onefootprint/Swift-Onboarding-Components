use actix_web::get;
use actix_web::web;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::telemetry::RootSpan;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;

#[get("/private/entities/{id}")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    id: web::Path<String>,
    root_span: RootSpan,
) -> ModernApiResult<api_wire_types::SuperAdminEntity> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let id = id.into_inner();

    let sv = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let id = ScopedVaultIdentifier::SuperAdminView { identifier: &id };
            let sv = ScopedVault::get(conn, id)?;
            Ok(sv)
        })
        .await?;
    root_span.record("fp_id", sv.fp_id.to_string());

    Ok(api_wire_types::SuperAdminEntity::from_db(sv))
}
