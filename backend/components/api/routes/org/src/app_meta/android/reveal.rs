use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use db::models::tenant_android_app_meta::TenantAndroidAppMeta;
use newtypes::TenantAndroidAppMetaId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Decrypts a specific android app metadata entry",
    tags(OrgSettings, Organization, Private)
)]
#[post("/org/app_meta/android/{meta_id}/reveal")]
/// Note, we make this a post because it does a decrypt operation. In the future, we may
/// make an access event for it
async fn post(
    state: web::Data<State>,
    meta_id: web::Path<TenantAndroidAppMetaId>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::TenantAndroidAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let meta_id = meta_id.into_inner();
    let result = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let result = TenantAndroidAppMeta::get(conn, meta_id, &tenant_id)?;
            Ok(result)
        })
        .await?;

    let tenant = auth.tenant();
    let decrypted_integrity_verification_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_integrity_verification_key, &tenant.e_private_key)
        .await?;
    let decrypted_integrity_decryption_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_integrity_decryption_key, &tenant.e_private_key)
        .await?;

    Ok(api_wire_types::TenantAndroidAppMeta::from_db((
        result,
        Some(decrypted_integrity_verification_key.leak().to_string()),
        Some(decrypted_integrity_decryption_key.leak().to_string()),
    )))
}
