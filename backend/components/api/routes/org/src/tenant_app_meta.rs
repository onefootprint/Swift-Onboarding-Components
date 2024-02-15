use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::tenant::TenantError,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::types::{EmptyResponse, JsonApiResponse};
use db::{models::tenant_app_meta::TenantAppMeta, DbResult};
use newtypes::{TenantAppKind, TenantAppMetaId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a list of tenant apps' metadata.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/app_meta")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<api_wire_types::GetTenantAppMetaRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<Vec<api_wire_types::TenantAppMeta>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();

    let api_wire_types::GetTenantAppMetaRequest { kind } = filters.into_inner();

    let list = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantAppMeta::list(conn, &tenant_id, kind) })
        .await?
        .into_iter()
        .map(api_wire_types::TenantAppMeta::from_db)
        .collect();
    ResponseData::ok(list).json()
}

#[api_v2_operation(
    description = "Creates a tenant app metadata entry for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::post("/org/app_meta")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantAppMetaRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::TenantAppMeta> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let api_wire_types::CreateTenantAppMetaRequest {
        kind,
        name,
        ios_app_bundle_id,
        ios_team_id,
        android_package_name,
        android_apk_cert_sha256,
    } = request.into_inner();

    match kind {
        TenantAppKind::Ios => {
            if ios_app_bundle_id.is_none()
                || ios_team_id.is_none()
                || android_package_name.is_some()
                || android_apk_cert_sha256.is_some()
            {
                return Err(TenantError::ValidationError(
                    "For iOS kind, only iOS fields must be provided and filled".to_owned(),
                )
                .into());
            }
        }
        TenantAppKind::Android => {
            if android_package_name.is_none()
                || android_apk_cert_sha256.is_none()
                || ios_app_bundle_id.is_some()
                || ios_team_id.is_some()
            {
                return Err(TenantError::ValidationError(
                    "For Android kind, only Android fields must be provided and filled".to_owned(),
                )
                .into());
            }
        }
    }

    let new_tenant_app_meta = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            TenantAppMeta::create(
                conn,
                tenant_id,
                kind,
                name,
                ios_app_bundle_id,
                ios_team_id,
                android_package_name,
                android_apk_cert_sha256,
            )
        })
        .await?;
    ResponseData::ok(api_wire_types::TenantAppMeta::from_db(new_tenant_app_meta)).json()
}

#[api_v2_operation(
    description = "Delete a tenant app metadata for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::delete("/org/app_meta/{app_meta_id}")]
pub async fn delete(
    state: web::Data<State>,
    app_meta_id: web::Path<TenantAppMetaId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let tam_id = app_meta_id.into_inner();
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantAppMeta::deactivate(conn, &tenant_id, &tam_id) })
        .await?;

    EmptyResponse::ok().json()
}
