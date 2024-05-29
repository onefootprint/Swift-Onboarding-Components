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
use db::models::rule_set_result::RuleSetResult;
use db::models::scoped_vault::ScopedVault;
use db::DbResult;
use newtypes::{
    FpId,
    RuleSetResultId,
};
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

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
) -> JsonApiResponse<Option<api_wire_types::RuleSetResult>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let result = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RuleSetResult::latest_workflow_decision(conn, &sv.id)
        })
        .await?
        .map(api_wire_types::RuleSetResult::from_db);

    ResponseData::ok(result).json()
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
) -> JsonApiResponse<api_wire_types::RuleSetResult> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, rsr_id) = request.into_inner();

    let rsr = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?; // permission check
            RuleSetResult::get(conn, &rsr_id)
        })
        .await?;
    ResponseData::ok(api_wire_types::RuleSetResult::from_db(rsr)).json()
}
