use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use db::models::tenant_ios_app_meta::TenantIosAppMeta;
use newtypes::TenantIosAppMetaId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Decrypts a specific ios app metadata entry",
    tags(OrgSettings, Organization, Private)
)]
#[post("/org/app_meta/ios/{meta_id}/reveal")]
/// Note, we make this a post because it does a decrypt operation. In the future, we may
/// make an access event for it
async fn post(
    state: web::Data<State>,
    meta_id: web::Path<TenantIosAppMetaId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::TenantIosAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let meta_id = meta_id.into_inner();
    let result = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let result = TenantIosAppMeta::get(conn, meta_id, &tenant_id)?;
            Ok(result)
        })
        .await?;

    let tenant = auth.tenant();
    let decrypted_device_check_private_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_device_check_private_key, &tenant.e_private_key)
        .await?;

    Ok(api_wire_types::TenantIosAppMeta::from_db((
        result,
        Some(decrypted_device_check_private_key.leak().to_string()),
    )))
}
