use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::utils::fp_id_path::FpIdPath;
use api_wire_types::ListTimelineRequest;
use db::models::user_timeline::UserTimeline;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

type TimelineEventsResponse = Vec<api_wire_types::UserTimeline>;

#[api_v2_operation(
    description = "Gets the timeline for a user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    filters: web::Query<ListTimelineRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<TimelineEventsResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let ListTimelineRequest { kinds } = filters.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| UserTimeline::list(conn, (&fp_id, &tenant_id, is_live), kinds))
        .await?;
    let events = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    ResponseData::ok(events).json()
}
