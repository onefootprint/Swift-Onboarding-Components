use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiError,
    get::{search::decrypt_visible_attrs, EntityDetailResponse},
    types::{JsonApiResponse, ResponseData},
    utils::vault_wrapper::VaultWrapper,
    State,
};
use api_core::{
    utils::{db2api::DbToApi, fp_id_path::FpIdPath, vault_wrapper::TenantVw},
    ApiErrorKind,
};
use db::{models::scoped_vault::ScopedVault, scoped_vault::ScopedVaultListQueryParams};
use paperclip::actix::{api_v2_operation, get, web};

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
        external_id: None,
        labels: vec![],
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
