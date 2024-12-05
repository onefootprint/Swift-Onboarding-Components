use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::types::Base64Cursor;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::fp_id_path::FpIdPath;
use api_wire_types::ListTimelineRequest;
use db::models::user_timeline::UserTimeline;
use db::models::user_timeline::UserTimelineCursor;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Gets the timeline for a user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    filters: web::Query<ListTimelineRequest>,
    pagination: web::Query<CursorPaginationRequest<Base64Cursor<UserTimelineCursor>>>,
    auth: TenantSessionAuth,
) -> CursorPaginatedResponse<api_wire_types::UserTimeline, Base64Cursor<UserTimelineCursor>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let ListTimelineRequest { kinds } = filters.into_inner();

    let pagination = pagination.into_inner().map_cursor(|c| c.into_inner());
    let pagination = pagination.db_pagination(&state);
    let (events, next_cursor) = state
        .db_query(move |conn| UserTimeline::list(conn, (&fp_id, &tenant_id, is_live), kinds, pagination))
        .await?;
    let results = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    let next_cursor = next_cursor.map(Base64Cursor::new);
    CursorPaginatedResponseInner::ok(results, next_cursor, None)
}
