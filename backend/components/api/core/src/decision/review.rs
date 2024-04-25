use crate::{auth::tenant::AuthActor, errors::ApiResult};
use api_wire_types::{CreateAnnotationRequest, DecisionRequest};
use db::{
    models::{
        annotation::Annotation,
        manual_review::{ManualReviewAction, ManualReviewArgs},
        onboarding_decision::NewDecisionArgs,
        scoped_vault::ScopedVault,
        workflow::{Workflow, WorkflowUpdate},
    },
    TxnPgConn,
};
use newtypes::{DbActor, Locked, ManualReviewKind};
use strum::IntoEnumIterator;

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

    // If a manual review will be cleared or we will create a new decision, the operation
    // is not a no-op and we should create an annotation in the DB
    let annotation = Annotation::create(conn, note, is_pinned, sv.id.clone(), actor.clone())?;

    // Clear all manual reviews. In the future, we could have the client pass in exactly which
    // manual review kinds the user has decided to clear
    let manual_reviews = ManualReviewKind::iter()
        .map(|kind| ManualReviewArgs {
            kind,
            action: ManualReviewAction::Complete,
        })
        .collect();

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
        manual_reviews,
        rule_set_result_id: None,
    };

    // NOTE: must do this after completing the manual review
    let update = WorkflowUpdate::set_decision(&wf, new_decision);
    Workflow::update(wf, conn, update)?;

    Ok(())
}
