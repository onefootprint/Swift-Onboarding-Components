use actix_multipart::Multipart;
use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant::{
    Tenant,
    UpdateTenant,
};
use paperclip::actix::web::HttpRequest;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Upload a new logo for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::put("/org/logo")]
pub async fn put(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    payload: Multipart,
    request: HttpRequest,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let logo_url =
        api_route_org_common::logo::upload_org_logo(&state, (&tenant_id).into(), payload, request).await?;

    // update the tenant url
    let update_tenant = UpdateTenant {
        logo_url: Some(logo_url),
        ..Default::default()
    };

    let updated_tenant = state
        .db_pool
        .db_query(move |conn| Tenant::update(conn, &tenant_id, update_tenant))
        .await?;

    Ok(api_wire_types::Organization::from_db(updated_tenant))
}
