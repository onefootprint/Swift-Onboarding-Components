use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Either;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use api_wire_types::CreateLabelRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_label::ScopedVaultLabel;
use macros::route_alias;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[route_alias(actix::post(
    "/users/{fp_id:fp_[_A-Za-z0-9]*}/label",
    description = "Update a user's label",
    tags(Users, Preview)
))]
#[api_v2_operation(description = "Update a user's label", tags(Entities, Private))]
#[actix::post("/entities/{fp_id:fp_[_A-Za-z0-9]*}/label")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: Either<TenantSessionAuth, TenantApiKeyGated<preview_api::Labels>>,
    request: Json<CreateLabelRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let label_kind = request.kind;

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            ScopedVaultLabel::create(conn, sv, label_kind)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[route_alias(actix::get(
    "/users/{fp_id:fp_[_A-Za-z0-9]*}/label",
    description = "View a user's label",
    tags(Users, Preview)
))]
#[api_v2_operation(description = "View a user's label", tags(Entities, Private))]
#[actix::get("/entities/{fp_id:fp_[_A-Za-z0-9]*}/label")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: Either<TenantSessionAuth, TenantApiKeyGated<preview_api::Labels>>,
) -> ApiResponse<api_wire_types::UserLabel> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let label = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            Ok(ScopedVaultLabel::get_active(conn, &sv.id)?)
        })
        .await?;

    Ok(api_wire_types::UserLabel {
        kind: label.as_ref().map(|l| l.kind),
        created_at: label.map(|l| l.created_at),
    })
}
