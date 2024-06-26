use crate::actions::EntityActionPostCommit;
use api_core::decision::review::save_review_decision;
use api_core::errors::onboarding::OnboardingError;
use api_core::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::ManualDecisionRequest;

pub(super) fn apply_manual_decision(
    conn: &mut TxnPgConn,
    request: ManualDecisionRequest,
    sv: &ScopedVault,
    actor: DbActor,
) -> FpResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
    let ManualDecisionRequest { annotation, status } = request;
    save_review_decision(conn, wf, status.into(), Some(annotation), actor)?;
    Ok(EntityActionPostCommit::FireWebhooks)
}

pub(super) fn clear_review(
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    actor: DbActor,
) -> FpResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
    save_review_decision(conn, wf, DecisionStatus::None, None, actor)?;
    Ok(EntityActionPostCommit::FireWebhooks)
}
