use crate::actions::EntityActionPostCommit;
use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::ModernApiResult;
use crate::State;
use api_core::decision::review::save_review_decision;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use newtypes::{
    DbActor,
    ManualDecisionRequest,
};
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
    request: web::Json<ManualDecisionRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor().into();
    let fp_id = fp_id.into_inner();
    let request = request.into_inner();

    let outcome = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let outcome = apply_manual_decision(conn, request, &sv, actor)?;
            Ok(outcome)
        })
        .await?;

    outcome.apply(&state)?;

    Ok(api_wire_types::Empty)
}

pub(super) fn apply_manual_decision(
    conn: &mut TxnPgConn,
    request: ManualDecisionRequest,
    sv: &ScopedVault,
    actor: DbActor,
) -> ApiResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
    let ManualDecisionRequest { annotation, status } = request;
    save_review_decision(conn, wf, status.into(), Some(annotation), actor)?;
    Ok(EntityActionPostCommit::FireWebhooks)
}
