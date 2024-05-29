use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::decision::vendor::neuro_id::tenant_can_view_neuro;
use api_core::serializers::user_insights;
use api_core::types::{
    JsonApiResponse,
    ResponseData,
};
use api_core::utils::fp_id_path::FpIdPath;
use api_core::State;
use db::models::insight_event::InsightEvent;
use db::models::neuro_id_analytics_event::NeuroIdAnalyticsEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::DbResult;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

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

    let can_view_neuro = tenant_can_view_neuro(&state, &tenant_id);
    let (behavior_events, latest_completed_wf, insight_event_for_latest_wf) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let behavior = if can_view_neuro {
                NeuroIdAnalyticsEvent::list(conn, &sv.id)?
            } else {
                vec![]
            };
            let latest_completed_wf = Workflow::latest_reonboardable(conn, &sv.id, true)?.map(|(wf, _)| wf);
            let insight_event_for_latest_wf = if let Some(ref wf) = latest_completed_wf {
                InsightEvent::get_for_workflow(conn, &wf.id)?
            } else {
                None
            };
            Ok((behavior, latest_completed_wf, insight_event_for_latest_wf))
        })
        .await?;
    // TODO: add unique key on wf_id
    // TODO: add aggregations

    ResponseData::ok(user_insights::from_db(
        behavior_events.first().cloned(),
        latest_completed_wf,
        insight_event_for_latest_wf,
    ))
    .json()
}
