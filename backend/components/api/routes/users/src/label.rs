use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
};
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::errors::ApiResult;
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
    ResponseData,
};
use api_core::utils::fp_id_path::FpIdPath;
use api_wire_types::CreateLabelRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_label::ScopedVaultLabel;
use newtypes::PreviewApi;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(description = "Update a user's label", tags(Users, Preview))]
#[actix::post("/users/{fp_id}/label")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
    request: Json<CreateLabelRequest>,
) -> JsonApiResponse<EmptyResponse> {
    auth.check_preview_guard(PreviewApi::Labels)?;
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let label_kind = request.kind;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            ScopedVaultLabel::create(conn, sv, label_kind)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "View a user's label", tags(Users, Preview))]
#[actix::get("/users/{fp_id}/label")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::UserLabel> {
    auth.check_preview_guard(PreviewApi::Labels)?;
    let auth = auth.check_guard(TenantGuard::LabelAndTag)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let label = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            Ok(ScopedVaultLabel::get_active(conn, &sv.id)?)
        })
        .await?;

    ResponseData::ok(api_wire_types::UserLabel {
        kind: label.as_ref().map(|l| l.kind),
        created_at: label.map(|l| l.created_at),
    })
    .json()
}
