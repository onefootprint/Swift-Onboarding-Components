use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::OffsetPaginatedResponse;
use crate::types::OffsetPaginatedResponseMetaNoCount;
use crate::types::OffsetPaginationRequest;
use crate::utils::db2api::DbToApi;
use crate::utils::fp_id_path::FpIdPath;
use crate::web::Json;
use crate::ApiResponse;
use crate::FpResult;
use crate::State;
use db::models::data_lifetime::DataLifetime;
use db::models::rule_set_result::RuleSetResult;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use std::collections::HashMap;

type OnboardingsListResponse =
    OffsetPaginatedResponse<api_wire_types::EntityOnboarding, OffsetPaginatedResponseMetaNoCount>;

#[api_v2_operation(
    description = "Get the list of playbooks this user has onboarded onto, ordered by timestamp descending. If a user has onboarded onto one playbook multiple times, there will be multiple onboardings. Useful to find the status from onboarding onto a specific playbook.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/onboardings")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<OffsetPaginationRequest>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiResponse<Json<OnboardingsListResponse>> {
    let auth = auth.check_guard(TenantGuard::Read)?;

    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let pagination = pagination.db_pagination(&state);
    let (wfs, next_page) = state
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (wfs, next_page) = Workflow::list(conn, &sv.id, pagination)?;
            let wf_ids = wfs.iter().map(|(wf, _)| wf.id.clone()).collect_vec();

            // Hide rule set results in sandbox because outcome will be confusing.
            let wf_id_to_rsrs = if is_live {
                RuleSetResult::bulk_get_for_workflows(conn, wf_ids.clone())?
            } else {
                HashMap::new()
            };

            let mut wf_id_to_seqno = HashMap::new();
            for (wf, _) in &wfs {
                let ts = wf.completed_at.or(wf.deactivated_at);
                if let Some(ts) = ts {
                    let seqno = DataLifetime::get_seqno_at(conn, ts)?;
                    wf_id_to_seqno.insert(wf.id.clone(), seqno);
                }
            }

            let results = wfs
                .into_iter()
                .map(|(wf, obc)| {
                    let rsrs = wf_id_to_rsrs.get(&wf.id).cloned().unwrap_or_default();
                    let seqno = wf_id_to_seqno.get(&wf.id).cloned();
                    (wf, obc, rsrs, seqno)
                })
                .collect_vec();

            Ok((results, next_page))
        })
        .await?;

    let onboardings = wfs
        .into_iter()
        .map(api_wire_types::EntityOnboarding::from_db)
        .collect();

    let response = OffsetPaginatedResponse::ok_no_count(onboardings, next_page);
    Ok(Json(response))
}
