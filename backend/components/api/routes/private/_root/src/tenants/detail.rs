use actix_web::get;
use actix_web::web;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiResponse;
use api_core::utils;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant::Tenant;
use newtypes::TenantId;

#[get("/private/tenants/{id}")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    id: web::Path<TenantId>,
) -> ApiResponse<api_wire_types::PrivateTenantDetail> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let id = id.into_inner();

    let (tenant, bp, tvc, tbi) = state.db_query(move |conn| Tenant::private_get(conn, &id)).await?;

    let tbi = if let Some(tbi) = tbi {
        let tbi =
            utils::tenant_business_info::decrypt_tenant_business_info(&state.enclave_client, &tenant, &tbi)
                .await?;
        Some(api_wire_types::TenantBusinessInfo::from_db(tbi))
    } else {
        None
    };

    let response = api_wire_types::PrivateTenantDetail::from_db((tenant, bp, tvc, tbi));
    Ok(response)
}
