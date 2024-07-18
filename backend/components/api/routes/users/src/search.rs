use crate::auth::tenant::SecretTenantAuthContext;
use crate::FpResult;
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
use newtypes::PiiString;
use newtypes::PreviewApi;
use newtypes::ScopedVaultCursor;
use newtypes::ScopedVaultCursorKind;
use newtypes::TimestampCursor;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Look up users based on external ID. This API is not intended to be used to paginate through all of your organization's users. To search for users based on PII, use the `POST /users/search` API.",
    tags(Users, Preview)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    request: web::Query<SearchUsersRequest>,
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> CursorPaginatedResponse<api_wire_types::LiteUser, i64> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    auth.check_preview_guard(PreviewApi::LegacyListUsersBusinesses)?;
    let tenant = auth.tenant();
    let SearchUsersRequest { search, external_id } = request.into_inner();
    let has_search = search.is_some();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        search,
        fp_id,
        kind: Some(VaultKind::Person),
        only_active: true,
        external_id,
        ..ScopedVaultListQueryParams::default()
    };
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

    // We're changing the kind of pagination we're using in `GET /entities`. But it's hard to
    // change for `GET /users` if anyone is using pagination since this API is tenant-facing.
    // Going to start logging to see if anyone is using it
    // Also changing whether we accept the search querystring, so jam that into the meta as well
    let meta = match (&cursor, has_search) {
        (Some(_), true) => "with_cursor,with_search",
        (Some(_), false) => "with_cursor,without_search",
        (None, true) => "without_cursor,with_search",
        (None, false) => "without_cursor,without_search",
    };
    // The root_span.record below doesn't seem to be working reliably... while investigating
    tracing::info!(%meta, "GET /users meta");
    root_span.record("meta", meta);

    let (svs, count) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let page_size = (page_size + 1) as i64;
            let cursor = cursor.map(ScopedVaultCursor::OrderingId);
            let order_by = ScopedVaultCursorKind::OrderingId;
            let (svs, count) = db::scoped_vault::list_and_count_authorized_for_tenant(
                conn, params, cursor, order_by, page_size,
            )?;
            Ok((svs, count))
        })
        .await?;

    let cursor = pagination.cursor_item(&state, &svs).map(|(sv, _)| sv.ordering_id);

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, page_size, cursor, Some(count))
}

#[derive(serde::Deserialize, paperclip::actix::Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct SearchUsersRequestBody {
    #[openapi(example = "sandbox@onefootprint.com")]
    pub search: PiiString,
    pub pagination: Option<CursorPaginationRequest<TimestampCursor>>,
}

#[api_v2_operation(description = "Search users by fingerprinted PII.", tags(Users, PublicApi))]
#[post("/users/search")]
pub async fn post_search(
    state: web::Data<State>,
    request: web::Json<SearchUsersRequestBody>,
    auth: SecretTenantAuthContext,
) -> CursorPaginatedResponse<api_wire_types::LiteUser, TimestampCursor> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let SearchUsersRequestBody { pagination, search } = request.into_inner();
    let pagination = pagination.unwrap_or_default();

    let (search, fp_id) = parse_search(&state, Some(search), &tenant.id).await?;
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        search,
        fp_id,
        kind: Some(VaultKind::Person),
        only_active: true,
        external_id: None,
        ..ScopedVaultListQueryParams::default()
    };
    let cursor = pagination.cursor.as_ref().map(|c| c.into());
    let page_size = pagination.page_size(&state);

    let (svs, count) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let page_size = (page_size + 1) as i64;
            let order_by = ScopedVaultCursorKind::LastActivityAt;
            let (svs, count) = db::scoped_vault::list_and_count_authorized_for_tenant(
                conn, params, cursor, order_by, page_size,
            )?;
            Ok((svs, count))
        })
        .await?;

    let cursor = pagination
        .cursor_item(&state, &svs)
        .map(|(sv, _)| TimestampCursor(sv.last_activity_at));

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, page_size, cursor, Some(count))
}
