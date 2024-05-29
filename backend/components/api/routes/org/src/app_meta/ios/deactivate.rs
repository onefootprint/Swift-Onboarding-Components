use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::EmptyResponse;
use crate::State;
use api_core::types::JsonApiResponse;
use db::models::tenant_ios_app_meta::TenantIosAppMeta;
use db::DbResult;
use newtypes::TenantIosAppMetaId;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Delete a tenant iOS app metadata for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::delete("/org/app_meta/ios/{meta_id}")]
pub async fn deactivate(
    state: web::Data<State>,
    meta_id: web::Path<TenantIosAppMetaId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();
    let meta_id = meta_id.into_inner();
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantIosAppMeta::deactivate(conn, &meta_id, &tenant_id) })
        .await?;

    EmptyResponse::ok().json()
}
