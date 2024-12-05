use crate::auth::tenant::TenantApiKeyAuth;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::telemetry::RootSpan;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::search_utils::parse_search;
use api_wire_types::SearchUsersRequest;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::preview_api;
use newtypes::PiiString;
use newtypes::ScopedVaultOrderingId;
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
    pagination: web::Query<CursorPaginationRequest<ScopedVaultOrderingId>>,
    request: web::Query<SearchUsersRequest>,
    auth: TenantApiKeyGated<preview_api::LegacyListUsersBusinesses>,
    root_span: RootSpan,
) -> CursorPaginatedResponse<api_wire_types::LiteUser, ScopedVaultOrderingId> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let pagination = pagination.into_inner();
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

    // We're changing the kind of pagination we're using in `GET /entities`. But it's hard to
    // change for `GET /users` if anyone is using pagination since this API is tenant-facing.
    // Going to start logging to see if anyone is using it
    // Also changing whether we accept the search querystring, so jam that into the meta as well
    let meta = match (pagination.cursor.as_ref(), has_search) {
        (Some(_), true) => "with_cursor,with_search",
        (Some(_), false) => "with_cursor,without_search",
        (None, true) => "without_cursor,with_search",
        (None, false) => "without_cursor,without_search",
    };
    // The root_span.record below doesn't seem to be working reliably... while investigating
    tracing::info!(%meta, "GET /users meta");
    root_span.record("meta", meta);

    let pagination = pagination.db_pagination(&state);
    let ((svs, next_cursor), count) = state
        .db_query(move |conn| {
            db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, pagination)
        })
        .await?;

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, next_cursor, Some(count))
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
    auth: TenantApiKeyAuth,
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
    let pagination = pagination.db_pagination(&state);

    let ((svs, next_cursor), count) = state
        .db_query(move |conn| {
            db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, pagination)
        })
        .await?;

    let results = svs.into_iter().map(api_wire_types::LiteUser::from_db).collect();
    CursorPaginatedResponseInner::ok(results, next_cursor, Some(count))
}
