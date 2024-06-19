use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::types::{
    JsonApiListResponse,
    ModernApiResult,
};
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::UpdateTenantAndroidAppMetaRequest;
use db::models::tenant_android_app_meta::{
    TenantAndroidAppFilters,
    TenantAndroidAppMeta,
};
use db::DbResult;
use newtypes::{
    SealedVaultBytes,
    TenantAndroidAppMetaId,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Returns a list of metadata for tenant Android apps.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/app_meta/android")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> JsonApiListResponse<api_wire_types::TenantAndroidAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let list = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let filters = TenantAndroidAppFilters {
                tenant_id,
                package_name: None,
            };
            let res = TenantAndroidAppMeta::list(conn, filters)?;
            Ok(res)
        })
        .await?
        .into_iter()
        .map(|partial_meta| (partial_meta, None, None))
        .map(api_wire_types::TenantAndroidAppMeta::from_db)
        .collect();
    Ok(list)
}

#[api_v2_operation(
    description = "Creates a tenant Android app metadata entry for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::post("/org/app_meta/android")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantAndroidAppMetaRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::TenantAndroidAppMeta> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let api_wire_types::CreateTenantAndroidAppMetaRequest {
        package_names,
        apk_cert_sha256s,
        integrity_verification_key,
        integrity_decryption_key,
    } = request.into_inner();

    let e_integrity_verification_key = tenant
        .public_key
        .seal_bytes(integrity_verification_key.as_bytes())?;
    let e_integrity_decryption_key = tenant
        .public_key
        .seal_bytes(integrity_decryption_key.as_bytes())?;

    let new_tenant_android_app_meta = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            TenantAndroidAppMeta::create(
                conn,
                tenant_id,
                package_names,
                apk_cert_sha256s,
                e_integrity_verification_key,
                e_integrity_decryption_key,
            )
        })
        .await?;
    Ok(api_wire_types::TenantAndroidAppMeta::from_db((
        new_tenant_android_app_meta,
        Some(integrity_verification_key),
        Some(integrity_decryption_key),
    )))
}

#[api_v2_operation(
    description = "Updates the provided tenant android app metadata",
    tags(OrgSettings, Organization, Private)
)]
#[actix::patch("/org/app_meta/android/{meta_id}")]
async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<TenantAndroidAppMetaId>,
    request: web::Json<UpdateTenantAndroidAppMetaRequest>,
) -> ModernApiResult<api_wire_types::TenantAndroidAppMeta> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let id = path.into_inner();

    let UpdateTenantAndroidAppMetaRequest {
        package_names,
        apk_cert_sha256s,
        integrity_verification_key,
        integrity_decryption_key,
    } = request.into_inner();

    let mut e_integrity_verification_key: Option<SealedVaultBytes> = None;
    let mut e_integrity_decryption_key: Option<SealedVaultBytes> = None;

    if let Some(ref key) = integrity_verification_key {
        e_integrity_verification_key = Some(tenant.public_key.seal_bytes(key.as_bytes())?);
    }
    if let Some(ref key) = integrity_decryption_key {
        e_integrity_decryption_key = Some(tenant.public_key.seal_bytes(key.as_bytes())?);
    }

    let result = state
        .db_pool
        .db_transaction(move |conn| {
            TenantAndroidAppMeta::update(
                conn,
                id,
                tenant_id,
                package_names,
                apk_cert_sha256s,
                e_integrity_verification_key,
                e_integrity_decryption_key,
            )
        })
        .await?;

    Ok(api_wire_types::TenantAndroidAppMeta::from_db((
        result,
        integrity_verification_key,
        integrity_decryption_key,
    )))
}
