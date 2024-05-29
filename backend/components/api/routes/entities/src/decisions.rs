use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::{
    EmptyResponse,
    JsonApiResponse,
};
use crate::State;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::{
    decision,
    task,
};
use api_wire_types::DecisionRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    description = "Creates a new override decision for an onboarding, overriding any previous decision and clearing any outstanding manual review.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/decisions")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<DecisionRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let fp_id = fp_id.into_inner();
    let request = request.into_inner();

    let fpid = fp_id.clone();
    let tid = tenant_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fpid, &tid, is_live))?;
            let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
            let wf = Workflow::lock(conn, &wf.id)?;
            decision::review::save_review_decision(conn, wf, request, actor)?;
            Ok(())
        })
        .await?;

    // Since we may have updated users onboarding status
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    EmptyResponse::ok().json()
}
