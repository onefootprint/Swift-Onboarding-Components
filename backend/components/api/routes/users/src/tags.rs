use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::types::JsonApiListResponse;
use api_core::types::ModernApiResult;
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
use newtypes::PreviewApi;
use newtypes::TagId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(description = "Tag a user", tags(Users, Preview))]
#[actix::post("/users/{fp_id}/tags")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
    request: Json<CreateTagRequest>,
) -> ModernApiResult<api_wire_types::UserTag> {
    auth.check_preview_guard(PreviewApi::Tags)?;
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let tag_kind = request.into_inner().tag;

    let tag = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let seqno = DataLifetime::get_current_seqno(conn)?;

            Ok(NewScopedVaultTag {
                created_at: Utc::now(),
                created_seqno: seqno,
                scoped_vault_id: sv.id,
                kind: tag_kind,
            }
            .insert(conn)?)
        })
        .await?;

    Ok(api_wire_types::UserTag::from_db(tag))
}

#[api_v2_operation(description = "View a user's tags", tags(Users, Preview))]
#[actix::get("/users/{fp_id}/tags")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
) -> JsonApiListResponse<api_wire_types::UserTag> {
    auth.check_preview_guard(PreviewApi::Tags)?;
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
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

#[api_v2_operation(description = "Untag a user", tags(Users, Preview))]
#[actix::delete("/users/{fp_id:fp_[_A-Za-z0-9]*}/tags/{tag_id:tag_[_A-Za-z0-9]*}")]
pub async fn delete(
    state: web::Data<State>,
    path: FpIdPathPlus<TagId>,
    auth: SecretTenantAuthContext,
) -> ModernApiResult<api_wire_types::Empty> {
    auth.check_preview_guard(PreviewApi::Tags)?;
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, tag_id) = path.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            Ok(ScopedVaultTag::deactivate(conn, &sv.id, &tag_id)?)
        })
        .await?;

    Ok(api_wire_types::Empty)
}
