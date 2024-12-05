use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::request::CursorPaginationRequest;
use api_core::types::response::CursorPaginatedResponse;
use api_core::types::Base64Cursor;
use api_core::types::CursorPaginatedResponseInner;
use api_core::utils::db2api::TryDbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::AuditEventRequest;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::AuditEventCursor;
use db::models::audit_event::FilterQueryParams;
use newtypes::AuditEventName;
use newtypes::DataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Query audit events, in descending order of timestamp.",
    tags(Organization, Private)
)]
#[get("/org/audit_events")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<AuditEventRequest>,
    pagination: web::Query<CursorPaginationRequest<Base64Cursor<AuditEventCursor>>>,
    auth: TenantSessionAuth,
) -> CursorPaginatedResponse<api_wire_types::AuditEvent, Base64Cursor<AuditEventCursor>> {
    let auth = auth.check_guard(TenantGuard::Read)?;

    let AuditEventRequest {
        names,
        targets,
        search,
        timestamp_lte,
        timestamp_gte,
        list_id,
    } = filters.into_inner();
    let tenant = auth.tenant();

    let params = FilterQueryParams {
        tenant_id: tenant.id.clone(),
        search,
        timestamp_lte,
        timestamp_gte,
        names: names.map(Vec::<AuditEventName>::from).unwrap_or_default(),
        targets: targets.map(Vec::<DataIdentifier>::from).unwrap_or_default(),
        is_live: Some(auth.is_live()?),
        list_id,
    };

    let pagination = pagination.into_inner().map_cursor(|c| c.into_inner());
    let pagination = pagination.db_pagination(&state);
    let ((results, next_cursor), secondary_data) = state
        .db_query(move |conn| AuditEvent::filter(conn, params, pagination))
        .await?;

    // If there are more than page_size results, we should tell the client there's another page.
    let next_cursor = next_cursor.map(Base64Cursor::new);
    let response = results
        .into_iter()
        .map(|e| (e, &secondary_data))
        .map(api_wire_types::AuditEvent::try_from_db)
        .collect::<FpResult<Vec<api_wire_types::AuditEvent>>>()?;
    CursorPaginatedResponseInner::ok(response, next_cursor, None)
}
