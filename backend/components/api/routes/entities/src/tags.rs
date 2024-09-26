use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Either;
use api_core::types::ApiListResponse;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::fp_id_path::FpIdPathPlus;
use api_core::FpResult;
use api_wire_types::CreateTagRequest;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_tag::NewScopedVaultTag;
use db::models::scoped_vault_tag::ScopedVaultTag;
use macros::route_alias;
use newtypes::preview_api;
use newtypes::DbActor;
use newtypes::TagId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
#[route_alias(actix::post(
    "/users/{fp_id:fp_[_A-Za-z0-9]*}/tags",
    description = "Tag a user",
    tags(Users, Preview)
))]
#[api_v2_operation(description = "Tag a user", tags(Entities, Private))]
#[actix::post("/entities/{fp_id:fp_[_A-Za-z0-9]*}/tags")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: Either<TenantSessionAuth, TenantApiKeyGated<preview_api::Tags>>,
    request: Json<CreateTagRequest>,
) -> ApiResponse<api_wire_types::UserTag> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let tag_kind = request.into_inner().tag;
    let actor: DbActor = auth.actor().into();

    let tag = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let seqno = DataLifetime::get_current_seqno(conn)?;
            let args = NewScopedVaultTag {
                created_at: Utc::now(),
                created_seqno: seqno,
                scoped_vault_id: sv.id,
                kind: tag_kind,
                created_by_actor: actor,
            };
            let tag = ScopedVaultTag::get_or_create(conn, args)?;

            Ok(tag)
        })
        .await?;

    Ok(api_wire_types::UserTag::from_db(tag))
}

#[route_alias(actix::get(
    "/users/{fp_id:fp_[_A-Za-z0-9]*}/tags",
    description = "View a user's tags",
    // TODO before removing from preview, paginate this API
    tags(Users, Preview)
))]
#[api_v2_operation(description = "View a user's tags", tags(Entities, Private))]
#[actix::get("/entities/{fp_id:fp_[_A-Za-z0-9]*}/tags")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: Either<TenantSessionAuth, TenantApiKeyGated<preview_api::Tags>>,
) -> ApiListResponse<api_wire_types::UserTag> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let tags = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            Ok(ScopedVaultTag::get_active(conn, &sv.id)?)
        })
        .await?;

    let tags = tags.into_iter().map(api_wire_types::UserTag::from_db).collect();
    Ok(tags)
}

#[route_alias(actix::delete(
    "/users/{fp_id:fp_[_A-Za-z0-9]*}/tags/{tag_id:tag_[_A-Za-z0-9]*}",
    description = "Untag a user",
    tags(Users, Preview)
))]
#[api_v2_operation(description = "Untag a user", tags(Entities, Private))]
#[actix::delete("/entities/{fp_id:fp_[_A-Za-z0-9]*}/tags/{tag_id:tag_[_A-Za-z0-9]*}")]
pub async fn delete(
    state: web::Data<State>,
    path: FpIdPathPlus<TagId>,
    auth: Either<TenantSessionAuth, TenantApiKeyGated<preview_api::Tags>>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let actor: DbActor = auth.actor().into();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, tag_id) = path.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            Ok(ScopedVaultTag::deactivate(conn, &sv.id, &tag_id, actor)?)
        })
        .await?;

    Ok(api_wire_types::Empty)
}
