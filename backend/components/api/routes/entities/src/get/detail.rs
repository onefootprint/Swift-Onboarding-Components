use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::get::search::decrypt_visible_attrs;
use crate::get::EntityDetailResponse;
use crate::types::{
    JsonApiResponse,
    ResponseData,
};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::errors::ApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::ApiErrorKind;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    description = "View details of a specific entity (business or user)",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id:fp_[_A-Za-z0-9]*}")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EntityDetailResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let fp_id = fp_id.into_inner();
    let is_live = auth.is_live()?;

    let (entity, vw) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let entity = ScopedVault::bulk_get_serializable_info(conn, vec![sv.id.clone()])?
                .remove(&sv.id)
                .ok_or(ApiErrorKind::ResourceNotFound)?;

            Ok((entity, vw))
        })
        .await?;

    let decrypted_results = decrypt_visible_attrs(&state, &auth, vec![&vw])
        .await?
        .into_values()
        .next()
        .unwrap_or_default();

    let result = api_wire_types::Entity::from_db((entity, &vw, &auth, decrypted_results));
    ResponseData::ok(result).json()
}
