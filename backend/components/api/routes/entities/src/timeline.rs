use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;

use crate::utils::db2api::DbToApi;
use crate::State;

use db::models::user_timeline::UserTimeline;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

type TimelineEventsResponse = Vec<api_wire_types::UserTimeline>;

#[api_v2_operation(
    description = "Gets the timeline for a user verification trail.",
    tags(Entities, Preview)
)]
#[get("/entities/{fp_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<TimelineEventsResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    // Not all tenants should see socure related risk signals
    let tenant_can_view_socure_risk_signal = state
        .feature_flag_client
        .flag(BoolFlag::CanViewSocureRiskSignals(&tenant_id));

    let events = state
        .db_pool
        .db_query(move |conn| {
            UserTimeline::list(
                conn,
                (&fp_id, &tenant_id, is_live),
                tenant_can_view_socure_risk_signal,
            )
        })
        .await??;
    let events = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    ResponseData::ok(events).json()
}
