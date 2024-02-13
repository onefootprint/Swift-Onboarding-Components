use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    types::{request::CursorPaginationRequest, response::CursorPaginatedResponse},
    utils::db2api::TryDbToApi,
    State,
};
use api_core::{
    errors::ApiResult,
    types::{Base64Cursor, CursorPaginatedResponseInner},
};
use api_wire_types::{AuditEvent, AuditEventRequest};
use chrono::{DateTime, Utc};
use db::{models::audit_event::FilterQueryParams, DbResult};
use itertools::chain;
use newtypes::{AuditEventId, DataIdentifier};
use paperclip::actix::{api_v2_operation, get, web};
use serde::{Deserialize, Serialize};

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
) -> CursorPaginatedResponse<Vec<AuditEvent>, Base64Cursor<AuditEventCursor>> {
    let auth = auth.check_guard(TenantGuard::Read)?;

    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor.as_ref().map(|co| co.inner());
    let (cursor_id, cursor_ts) = match cursor {
        Some(AuditEventCursor { id, timestamp }) => (Some(id.clone()), Some(timestamp)),
        None => (None, None),
    };

    let AuditEventRequest {
        name,
        targets,
        search,
        timestamp_lte,
        timestamp_gte,
    } = filters.into_inner();
    let tenant = auth.tenant();

    let params = FilterQueryParams {
        id_lt: cursor_id,
        tenant_id: tenant.id.clone(),
        search,
        timestamp_lte: chain!(timestamp_lte, cursor_ts.copied()).min(),
        timestamp_gte,
        name,
        targets: targets.map(Vec::<DataIdentifier>::from).unwrap_or_default(),
        is_live: auth.is_live()?,
    };

    let results = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
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
        .take(page_size)
        .map(api_wire_types::AuditEvent::try_from_db)
        .collect::<ApiResult<Vec<api_wire_types::AuditEvent>>>()?;
    CursorPaginatedResponseInner::ok(response, next_cursor, None)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEventCursor {
    pub timestamp: DateTime<Utc>,
    pub id: AuditEventId,
}
