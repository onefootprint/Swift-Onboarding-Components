use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::rule_set_result::RuleSetResult;
use db::models::scoped_vault::ScopedVault;
use db::DbResult;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Retrieves the result of executing rules from the latest workflow decision made",
    tags(EntityDetails, Entities, Private, Rules)
)]
#[get("/entities/{fp_id}/rule_set_result")]
pub async fn get(
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
        .await??
        .map(api_wire_types::RuleSetResult::from_db);

    ResponseData::ok(result).json()
}
