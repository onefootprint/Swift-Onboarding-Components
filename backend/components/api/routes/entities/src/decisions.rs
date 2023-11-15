use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::decision;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::ReviewCompleted;
use api_core::decision::state::StateError;
use api_core::decision::state::WorkflowWrapper;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::task;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::ApiErrorKind;
use api_wire_types::DecisionRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::DbResult;
use paperclip::actix::{api_v2_operation, post, web};

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
    let wf = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fpid, &tid, is_live))?;
            let wf = Workflow::get_active(conn, &sv.id)?;
            Ok(wf)
        })
        .await??;
    let wf = wf.ok_or(OnboardingError::NoWorkflow)?;

    let wf_id = wf.id.clone();
    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    // TODO: add a ww.expects_action method here to check if the workflow is expecting ReviewCompleted or not. If not, for now we should probably gracefully
    // just continue and do what this route would have done anyway (ie call save_review_decision). But in the future, we may instead query here for
    // an existing *active* workflow and if there is one, then strictly error if a review is being made when that workflow isn't expecting it
    let action = WorkflowActions::ReviewCompleted(ReviewCompleted {
        decision: request.clone(),
        actor: actor.clone(),
    });
    let res = ww.run(&state, action).await;
    match res {
        Ok(_) => return EmptyResponse::ok().json(),
        Err(e) => match e.kind() {
            ApiErrorKind::StateError(StateError::UnexpectedActionForState) => {
                tracing::info!(workflow_id=?wf.id, state=?wf.state, "ReviewCompleted called on workflow not expecting it");
            }
            _ => Err(e)?,
        },
    }

    state
        .db_pool
        // TODO how does this work when there are multiple KYC workflows for one scoped vault?
        .db_transaction(move |conn| -> ApiResult<_> {
            let wf = Workflow::lock(conn, &wf_id)?;
            decision::review::save_review_decision(conn, wf, request, actor)?;
            Ok(())
        })
        .await?;
    // Since we may have updated users onboarding status
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    EmptyResponse::ok().json()
}
