use crate::FpResult;
use db::models::annotation::Annotation;
use db::models::data_lifetime::DataLifetime;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::manual_review::ManualReviewAction;
use db::models::manual_review::ManualReviewArgs;
use db::models::onboarding_decision::NewDecisionArgs;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::CreateAnnotationRequest;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::DocumentReviewStatus;
use newtypes::ManualReviewKind;
use newtypes::UserSpecificWebhookKind;
use strum::IntoEnumIterator;

pub fn save_review_decision(
    conn: &mut TxnPgConn,
    wf: Workflow,
    status: DecisionStatus,
    annotation: Option<CreateAnnotationRequest>,
    actor: DbActor,
) -> FpResult<()> {
    let wf = Workflow::lock(conn, &wf.id)?;
    let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;

    // If a manual review will be cleared or we will create a new decision, the operation
    // is not a no-op and we should create an annotation in the DB
    let annotation = annotation
        .map(|a| Annotation::create(conn, a.note, a.is_pinned, sv.id.clone(), actor.clone()))
        .transpose()?;

    // Clear all manual reviews because a human has manually made this decision. In the future, we could
    // have the client pass in exactly which manual review kinds the user has decided to clear
    let mrs_to_clear = ManualReviewKind::iter()
        .map(|kind| ManualReviewArgs {
            kind,
            action: ManualReviewAction::Complete,
        })
        .collect_vec();

    if mrs_to_clear
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
    let decision = NewDecisionArgs {
        vault_id: sv.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status,
        annotation_id: annotation.map(|(a, _)| a.id),
        actor,
        seqno,
        manual_reviews: mrs_to_clear,
        rule_set_result_id: None,
        failed_for_doc_review: false,
    };

    let (obd, mr_deltas) = OnboardingDecision::create_decision_and_mrs(conn, &wf, decision)?;

    // Notably, we skip updating the Workflow's status here. ManualReview makes an OBD (associated with
    // the workflow, strangely) and update's the ScopedVault's status, but we want to keep the
    // Workflow's status equal to the output of running rules.
    let sv_delta = ScopedVault::update_status_if_valid(conn, &sv.id, obd.status.into())?;
    wf.maybe_fire_status_changed_webhook(conn, sv_delta, mr_deltas)?;

    Ok(())
}
