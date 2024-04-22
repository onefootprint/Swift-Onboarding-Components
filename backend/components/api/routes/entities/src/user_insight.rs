use api_core::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    serializers::user_insights,
    types::{JsonApiResponse, ResponseData},
    utils::fp_id_path::FpIdPath,
    State,
};
use db::{
    models::{neuro_id_analytics_event::NeuroIdAnalyticsEvent, scoped_vault::ScopedVault},
    DbResult,
};
use paperclip::actix::{api_v2_operation, get, web};

type UserInsightResponse = Vec<api_wire_types::UserInsight>;

#[api_v2_operation(
    description = "Lists the user insights for a Ffootprint user",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/user_insights")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<UserInsightResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();


    let behavior_events = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            NeuroIdAnalyticsEvent::list(conn, &sv.id)
        })
        .await?;
    // TODO: add unique key on wf_id
    // TODO: add aggregations

    let behavior_insights = if let Some(behavior) = behavior_events.first() {
        user_insights::from_db(behavior.clone())
    } else {
        vec![]
    };


    ResponseData::ok(behavior_insights).json()
}
