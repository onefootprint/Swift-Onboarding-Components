use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_wire_types::ModernSearchRequest;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::preview_api;
use newtypes::ScopedVaultOrderingId;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Look up businesses based on external ID. This API is not intended to be used to paginate through all of your organization's businesses.",
    tags(Businesses, Preview)
)]
#[get("/businesses")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<ScopedVaultOrderingId>>,
    request: web::Query<ModernSearchRequest>,
    auth: TenantApiKeyGated<preview_api::LegacyListUsersBusinesses>,
) -> CursorPaginatedResponse<api_wire_types::LiteUser, ScopedVaultOrderingId> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let ModernSearchRequest { external_id } = request.into_inner();

    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        search: None,
        fp_id: None,
        kind: Some(VaultKind::Business),
        only_active: true,
        external_id,
        ..ScopedVaultListQueryParams::default()
    };

    let pagination = pagination.into_inner().db_pagination(&state);
    let ((svs, next_cursor), count) = state
        .db_query(move |conn| {
            db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, pagination)
        })
        .await?;

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, next_cursor, Some(count))
}
