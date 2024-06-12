use crate::auth::tenant::AuthActor;
use crate::errors::ApiResult;
use api_wire_types::{
    CreateAnnotationRequest,
    DecisionRequest,
};
use db::models::annotation::Annotation;
use db::models::data_lifetime::DataLifetime;
use db::models::document::{
    Document,
    DocumentUpdate,
};
use db::models::manual_review::{
    ManualReviewAction,
    ManualReviewArgs,
};
use db::models::onboarding_decision::NewDecisionArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::{
    Workflow,
    WorkflowUpdate,
};
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{
    DbActor,
    DocumentReviewStatus,
    Locked,
    ManualReviewKind,
    UserSpecificWebhookKind,
};
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
        .collect_vec();

    if manual_reviews
        .iter()
        .any(|r| r.kind == ManualReviewKind::DocumentNeedsReview)
    {
        // If we're clearing a ManualReview for DocumentNeedsReview, we should also implicitly
        // update the ID docs to be reviewed
        let id_docs = Document::list(conn, &wf.scoped_vault_id)?;
        let reviewed_docs = id_docs
            .into_iter()
            .filter(|(doc, _)| doc.review_status == DocumentReviewStatus::PendingHumanReview);
        for (doc, _) in reviewed_docs {
            let update = DocumentUpdate {
                review_status: Some(DocumentReviewStatus::ReviewedByHuman),
                ..Default::default()
            };
            Document::update(conn, &doc.id, update)?;
        }
    }

    // Fire a webhook noting that manual review has occurred
    sv.create_webhook_task(conn, UserSpecificWebhookKind::ManualReview)?;

    // Make the decision regardless of whether the status changed - the actor of the decision
    // may be different
    let seqno = DataLifetime::get_current_seqno(conn)?;
    let new_decision = NewDecisionArgs {
        vault_id: sv.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        result_ids: vec![],
        status: status.into(),
        annotation_id: Some(annotation.0.id),
        actor: DbActor::from(actor),
        seqno,
        manual_reviews,
        rule_set_result_id: None,
        failed_for_doc_review: false,
    };

    let update = WorkflowUpdate::set_decision(&wf, new_decision);
    Workflow::update(wf, conn, update)?;

    Ok(())
}
