use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::State;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "View basic details for a user. See the APIs under `/users/{fp_bid}/vault` for information on reading vault data.",
    tags(Users, PublicApi)
)]
#[get("/users/{fp_id:fp_[_A-Za-z0-9]*}")]
pub async fn detail(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
) -> ApiResponse<api_wire_types::User> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (sv, mrs, wfr) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let mr_filters = ManualReviewFilters::get_active();
            let mrs = ManualReview::get(conn, &sv.id, mr_filters)?;
            let wfr = WorkflowRequest::get_active(conn, &sv.id)?;
            Ok((sv, mrs, wfr))
        })
        .await?;

    let result = api_wire_types::User::from_db((sv, mrs, wfr));
    Ok(result)
}
