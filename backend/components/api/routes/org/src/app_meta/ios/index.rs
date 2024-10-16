use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiListResponse;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::UpdateTenantIosAppMetaRequest;
use db::models::tenant_ios_app_meta::TenantIosAppFilters;
use db::models::tenant_ios_app_meta::TenantIosAppMeta;
use db::DbResult;
use newtypes::SealedVaultBytes;
use newtypes::TenantIosAppMetaId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Returns a list of metadata for tenant ios apps.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/app_meta/ios")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> ApiListResponse<api_wire_types::TenantIosAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();

    let list = state
        .db_query(move |conn| -> DbResult<_> {
            let filters = TenantIosAppFilters {
                tenant_id,
                app_bundle_id: None,
            };
            let res = TenantIosAppMeta::list(conn, filters)?;
            Ok(res)
        })
        .await?
        .into_iter()
        .map(|partial_meta| (partial_meta, None))
        .map(api_wire_types::TenantIosAppMeta::from_db)
        .collect();
    Ok(list)
}

#[api_v2_operation(
    description = "Creates a tenant ios app metadata entry for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::post("/org/app_meta/ios")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantIosAppMetaRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::TenantIosAppMeta> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let api_wire_types::CreateTenantIosAppMetaRequest {
        team_id,
        app_bundle_ids,
        device_check_key_id,
        device_check_private_key,
    } = request.into_inner();

    let e_device_check_private_key = tenant
        .public_key
        .seal_bytes(device_check_private_key.as_bytes())?;

    let new_tenant_ios_app_meta = state
        .db_query(move |conn| -> DbResult<_> {
            TenantIosAppMeta::create(
                conn,
                tenant_id,
                team_id,
                app_bundle_ids,
                device_check_key_id,
                e_device_check_private_key,
            )
        })
        .await?;
    Ok(api_wire_types::TenantIosAppMeta::from_db((
        new_tenant_ios_app_meta,
        Some(device_check_private_key),
    )))
}

#[api_v2_operation(
    description = "Updates the provided tenant ios app metadata",
    tags(OrgSettings, Organization, Private)
)]
#[actix::patch("/org/app_meta/ios/{meta_id}")]
async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<TenantIosAppMetaId>,
    request: web::Json<UpdateTenantIosAppMetaRequest>,
) -> ApiResponse<api_wire_types::TenantIosAppMeta> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let id = path.into_inner();

    let UpdateTenantIosAppMetaRequest {
        team_id,
        app_bundle_ids,
        device_check_key_id,
        device_check_private_key,
    } = request.into_inner();

    let mut e_device_check_private_key: Option<SealedVaultBytes> = None;

    if let Some(ref key) = device_check_private_key {
        e_device_check_private_key = Some(tenant.public_key.seal_bytes(key.as_bytes())?);
    }

    let result = state
        .db_transaction(move |conn| {
            TenantIosAppMeta::update(
                conn,
                id,
                tenant_id,
                team_id,
                app_bundle_ids,
                device_check_key_id,
                e_device_check_private_key,
            )
        })
        .await?;

    Ok(api_wire_types::TenantIosAppMeta::from_db((
        result,
        device_check_private_key,
    )))
}
