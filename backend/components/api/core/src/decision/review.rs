use crate::auth::tenant::AuthActor;
use crate::errors::ApiResult;
use api_wire_types::CreateAnnotationRequest;
use api_wire_types::DecisionRequest;
use db::models::annotation::Annotation;
use db::models::onboarding_decision::NewDecisionArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::models::workflow::WorkflowUpdate;
use db::TxnPgConn;
use newtypes::DbActor;
use newtypes::Locked;

pub fn save_review_decision(
    conn: &mut TxnPgConn,
    wf: Locked<Workflow>,
    decision_request: DecisionRequest,
    actor: AuthActor,
) -> ApiResult<()> {
    let DecisionRequest {
        annotation: CreateAnnotationRequest { note, is_pinned },
        status,
    } = decision_request;

    let sv = ScopedVault::get(conn, &wf.id)?;

    // if wf.authorized_at.is_none() {
    //     // Can't make a decision on an onboarding that doesn't already have one
    //     return Err(TenantError::CannotMakeDecision.into());
    // }

    // If a manual review will be cleared or we will create a new decision, the operation
    // is not a no-op and we should create an annotation in the DB
    let annotation = Annotation::create(conn, note, is_pinned, sv.id.clone(), actor.clone())?;
    // Make the decision regardless of whether the status changed - the actor of the decision
    // may be different
    let new_decision = NewDecisionArgs {
        vault_id: sv.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        result_ids: vec![],
        status: status.into(),
        annotation_id: Some(annotation.0.id),
        actor: DbActor::from(actor),
        seqno: None,
        create_manual_review_reasons: None,
    };

    // NOTE: must do this after completing the manual review
    let update = WorkflowUpdate::set_decision(&wf, new_decision);
    Workflow::update(wf, conn, update)?;

    Ok(())
}
