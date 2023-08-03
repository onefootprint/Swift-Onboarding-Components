use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use api_wire_types::ListTimelineRequest;
use feature_flag::BoolFlag;

use crate::utils::db2api::DbToApi;
use crate::State;

use db::models::user_timeline::UserTimeline;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

type TimelineEventsResponse = Vec<api_wire_types::UserTimeline>;

#[api_v2_operation(
    description = "Gets the timeline for a user verification trail.",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    filters: web::Query<ListTimelineRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<TimelineEventsResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    // Not all tenants should see socure related risk signals
    let tenant_can_view_socure_risk_signal = state
        .feature_flag_client
        .flag(BoolFlag::CanViewSocureRiskSignals(&tenant_id));
    let ListTimelineRequest { kinds } = filters.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| {
            UserTimeline::list(
                conn,
                (&fp_id, &tenant_id, is_live),
                tenant_can_view_socure_risk_signal,
                kinds,
            )
        })
        .await??;
    let events = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    ResponseData::ok(events).json()
}
