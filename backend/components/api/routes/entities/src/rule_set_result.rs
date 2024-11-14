use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::ApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::rule_set_result::RuleSetResult;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use newtypes::RuleSetResultId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

// TODO: will deprecate this once the FE is no longer using in favor of the new API below
#[api_v2_operation(
    description = "Retrieves the result of executing rules from the latest workflow decision made",
    tags(EntityDetails, Entities, Private, Rules)
)]
#[get("/entities/{fp_id}/rule_set_result")]
pub async fn get_latest_workflow_decision(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiResponse<Option<api_wire_types::RuleSetResult>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let result = state
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RuleSetResult::latest_workflow_decision(conn, &sv.id)
        })
        .await?
        .map(api_wire_types::RuleSetResult::from_db);

    Ok(result)
}

#[api_v2_operation(
    description = "Retrieves the RuleSetResult for the given fp_id,rule_set_result_id",
    tags(EntityDetails, Entities, Private, Rules)
)]
#[get("/entities/{fp_id}/rule_set_result/{rule_set_result_id}")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<(FpId, RuleSetResultId)>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::RuleSetResult> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, rsr_id) = request.into_inner();

    let rsr = state
        .db_query(move |conn| {
            ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?; // permission check
            RuleSetResult::get(conn, &rsr_id)
        })
        .await?;
    Ok(api_wire_types::RuleSetResult::from_db(rsr))
}
