use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiListResponse;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant_tag::TenantTag;
use db::DbResult;
use newtypes::TenantTagId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Returns a list of Tags for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/tags")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<api_wire_types::GetOrgTenantTag>,
    auth: TenantSessionAuth,
) -> ApiListResponse<api_wire_types::OrgTenantTag> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let api_wire_types::GetOrgTenantTag { kind } = filters.into_inner();

    let list = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantTag::list(conn, &tenant_id, Some(kind), is_live) })
        .await?
        .into_iter()
        .map(api_wire_types::OrgTenantTag::from_db)
        .collect();
    Ok(list)
}

#[api_v2_operation(
    description = "Creates a new Tag for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::post("/org/tags")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateOrgTenantTagRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::OrgTenantTag> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let actor = auth.actor().into();
    let api_wire_types::CreateOrgTenantTagRequest { kind, tag } = request.into_inner();
    let tag = tag.trim().to_string();

    if tag.is_empty() {
        return Err(TenantError::ValidationError("tag cannot be empty".to_owned()).into());
    }

    let new_tag = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            TenantTag::create(conn, tenant_id, actor, kind, tag, is_live)
        })
        .await?;
    Ok(api_wire_types::OrgTenantTag::from_db(new_tag))
}

#[api_v2_operation(
    description = "Delete a tag for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::delete("/org/tags/{tag_id}")]
pub async fn delete(
    state: web::Data<State>,
    tag_id: web::Path<TenantTagId>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let actor = auth.actor().into();

    let t_id = tag_id.into_inner();

    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantTag::deactivate(conn, &tenant_id, &t_id, actor) })
        .await?;

    Ok(api_wire_types::Empty)
}
