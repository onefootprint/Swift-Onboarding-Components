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
use api_wire_types::AuditEvent;
use api_wire_types::AuditEventRequest;
use chrono::DateTime;
use chrono::Utc;
use db::models::audit_event::FilterQueryParams;
use db::DbResult;
use newtypes::AuditEventId;
use newtypes::AuditEventName;
use newtypes::DataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use serde::Deserialize;
use serde::Serialize;

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
) -> CursorPaginatedResponse<AuditEvent, Base64Cursor<AuditEventCursor>> {
    let auth = auth.check_guard(TenantGuard::Read)?;

    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor.as_ref().map(|co| co.inner());

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
        cursor: cursor.map(|c| (c.timestamp, c.id.clone())),
        tenant_id: tenant.id.clone(),
        search,
        timestamp_lte,
        timestamp_gte,
        names: names.map(Vec::<AuditEventName>::from).unwrap_or_default(),
        targets: targets.map(Vec::<DataIdentifier>::from).unwrap_or_default(),
        is_live: Some(auth.is_live()?),
        list_id,
    };

    let results = state
        .db_query(move |conn| -> DbResult<_> {
            use db::models::audit_event::AuditEvent;
            AuditEvent::filter(conn, params, (page_size + 1) as i64)
        })
        .await?;

    // If there are more than page_size results, we should tell the client there's another page.
    let next_cursor = pagination.cursor_item(&state, &results).map(|j| {
        Base64Cursor::new(AuditEventCursor {
            timestamp: j.audit_event.timestamp,
            id: j.audit_event.id.clone(),
        })
    });
    let response = results
        .into_iter()
        .map(api_wire_types::AuditEvent::try_from_db)
        .collect::<FpResult<Vec<api_wire_types::AuditEvent>>>()?;
    CursorPaginatedResponseInner::ok(response, page_size, next_cursor, None)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEventCursor {
    pub timestamp: DateTime<Utc>,
    pub id: AuditEventId,
}
