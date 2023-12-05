use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiResult;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::telemetry::RootSpan;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::search_utils::parse_search;
use api_wire_types::SearchUsersRequest;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::ScopedVaultCursor;
use newtypes::ScopedVaultCursorKind;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Get a list of users, optionally searching by fingerprint",
    tags(Users, Preview)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    request: web::Query<SearchUsersRequest>,
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> CursorPaginatedResponse<Vec<api_wire_types::LiteUser>, i64> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let SearchUsersRequest { search, external_id } = request.into_inner();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        search,
        fp_id,
        kind: Some(VaultKind::Person),
        only_visible: true,
        external_id,
        ..ScopedVaultListQueryParams::default()
    };
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

    // We're changing the kind of pagination we're using in `GET /entities`. But it's hard to
    // change for `GET /users` if anyone is using pagination since this API is tenant-facing.
    // Going to start logging to see if anyone is using it
    match &cursor {
        Some(_) => root_span.record("meta", "with_cursor"),
        None => root_span.record("meta", "without_cursor"),
    };

    let (svs, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let page_size = (page_size + 1) as i64;
            let cursor = cursor.map(ScopedVaultCursor::OrderingId);
            let order_by = ScopedVaultCursorKind::OrderingId;
            let (svs, count) = db::scoped_vault::list_and_count_authorized_for_tenant(
                conn, params, cursor, order_by, page_size,
            )?;
            Ok((svs, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &svs).map(|(sv, _)| sv.ordering_id);

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, cursor, Some(count))
}
