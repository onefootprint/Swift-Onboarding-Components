use crate::auth::tenant::AuthActor;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use api_wire_types::CreateAnnotationRequest;
use api_wire_types::DecisionRequest;
use db::models::annotation::Annotation;
use db::models::manual_review::ManualReview;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::OnboardingDecisionCreateArgs;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use newtypes::DbActor;
use newtypes::WorkflowId;

pub fn save_review_decision(
    conn: &mut TxnPgConn,
    wf_id: WorkflowId,
    decision_request: DecisionRequest,
    actor: AuthActor,
) -> ApiResult<()> {
    let DecisionRequest {
        annotation: CreateAnnotationRequest { note, is_pinned },
        status,
    } = decision_request;

    Workflow::lock(conn, &wf_id)?;
    let (wf, su) = Workflow::get_all(conn, &wf_id)?;
    let manual_review = ManualReview::get_active(conn, &wf_id)?;

    if wf.authorized_at.is_none() {
        // Can't make a decision on an onboarding that doesn't already have one
        return Err(TenantError::CannotMakeDecision.into());
    }

    // If a manual review will be cleared or we will create a new decision, the operation
    // is not a no-op and we should create an annotation in the DB
    let annotation = Annotation::create(conn, note, is_pinned, su.id.clone(), actor.clone())?;
    // Make the decision regardless of whether the status changed - the actor of the decision
    // may be different
    let new_decision = OnboardingDecisionCreateArgs {
        vault_id: su.vault_id,
        scoped_vault_id: su.id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        result_ids: vec![],
        status: status.into(),
        annotation_id: Some(annotation.0.id),
        actor: DbActor::from(actor.clone()),
        seqno: None,
        workflow_id: wf_id.clone(),
    };
    let decision = OnboardingDecision::create(conn, new_decision)?;

    // If there is an outstanding review, creating this override decision clears it
    // This has to happen before we update the status below, otherwise the webhook will incorrectly
    // show manual review is required
    if let Some(manual_review) = manual_review {
        manual_review.complete(conn, actor, decision.id)?;
    }

    if wf.status != Some(status.into()) {
        // This logic is getting convoluted - soon will switch to just workflow update
        let (ob, _) = Onboarding::get(conn, &wf.scoped_vault_id)?;
        let ob = Onboarding::lock(conn, &ob.id)?;
        let update = OnboardingUpdate::set_decision(status.into(), &ob);
        Onboarding::update(ob, conn, Some(&wf_id), update)?;
    }

    Ok(())
}
