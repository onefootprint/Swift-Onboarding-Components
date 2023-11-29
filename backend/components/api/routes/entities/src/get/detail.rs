use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::ApiError;
use crate::get::list::decrypt_visible_attrs;
use crate::get::EntityDetailResponse;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::ApiErrorKind;
use db::models::scoped_vault::ScopedVault;
use db::scoped_vault::ScopedVaultListQueryParams;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View details of a specific entity (business or user)",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id}")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EntityDetailResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        requires_manual_review: None,
        watchlist_hit: None,
        statuses: vec![],
        search: None,
        fp_id: Some(fp_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
        kind: None,
        // Show these entities in detail view
        only_visible: false,
        is_created_via_api: None,
        playbook_id: None,
        has_outstanding_workflow_request: None,
    };
    let (entity, vw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (sv, _) = db::scoped_vault::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiErrorKind::ResourceNotFound)?;
            let vw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let entity = ScopedVault::bulk_get_serializable_info(conn, vec![sv.id.clone()])?
                .remove(&sv.id)
                .ok_or(ApiErrorKind::ResourceNotFound)?;

            Ok((entity, vw))
        })
        .await??;

    let decrypted_results = decrypt_visible_attrs(&state, &auth, vec![&vw])
        .await?
        .into_values()
        .next()
        .unwrap_or_default();

    let result = api_wire_types::Entity::from_db((entity, &vw, &auth, decrypted_results));
    ResponseData::ok(result).json()
}
