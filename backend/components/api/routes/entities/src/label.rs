use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use api_wire_types::UpdateLabelRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_label::ScopedVaultLabel;
use newtypes::DbActor;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(description = "Update a user's label", tags(Entities, Private))]
#[actix::post("/entities/{fp_id:fp_[_A-Za-z0-9]*}/label")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
    request: Json<UpdateLabelRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let label_kind = request.kind;
    let actor: DbActor = auth.actor().into();

    state
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            if let Some(label) = label_kind {
                ScopedVaultLabel::create(conn, sv, label, actor)?;
            } else {
                ScopedVaultLabel::deactivate(conn, &sv.id, actor)?;
            }

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[api_v2_operation(description = "View a user's label", tags(Entities, Private))]
#[actix::get("/entities/{fp_id:fp_[_A-Za-z0-9]*}/label")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::UserLabel> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let label = state
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
