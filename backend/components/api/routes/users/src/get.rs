use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiResult;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_route_entities::parse_search;
use api_wire_types::SearchUsersRequest;
use db::scoped_vault::ScopedVaultListQueryParams;
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
) -> CursorPaginatedResponse<Vec<api_wire_types::LiteUser>, i64> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let SearchUsersRequest { search } = request.into_inner();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        search,
        fp_id,
        kind: Some(VaultKind::Person),
        only_visible: true,
        ..ScopedVaultListQueryParams::default()
    };
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

    let (svs, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let page_size = (page_size + 1) as i64;
            let (svs, count) =
                db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, cursor, page_size)?;
            Ok((svs, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &svs).map(|(sv, _)| sv.ordering_id);

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, cursor, Some(count))
}
