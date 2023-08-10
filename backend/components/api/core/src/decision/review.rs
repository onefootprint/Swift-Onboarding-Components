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
use db::models::scoped_vault::ScopedVault;
use db::TxnPgConn;
use newtypes::DbActor;
use newtypes::FpId;
use newtypes::TenantId;
use newtypes::WorkflowId;

pub fn save_review_decision(
    conn: &mut TxnPgConn,
    fp_id: &FpId,
    tenant_id: &TenantId,
    is_live: bool,
    decision_request: DecisionRequest,
    actor: AuthActor,
    workflow_id: Option<WorkflowId>,
) -> ApiResult<Option<(OnboardingDecision, ScopedVault)>> {
    let DecisionRequest {
        annotation: CreateAnnotationRequest { note, is_pinned },
        status,
    } = decision_request;

    let (ob, su, decision) = Onboarding::lock_for_tenant(conn, fp_id, tenant_id, is_live)?;
    let manual_review = workflow_id
        .as_ref()
        .map(|wf_id| ManualReview::get_active(conn, wf_id))
        .transpose()?
        .flatten();

    if !ob.is_complete() {
        // Can't make a decision on an onboarding that doesn't already have one
        return Err(TenantError::CannotMakeDecision.into());
    }

    let need_to_clear_manual_review = manual_review.is_some();
    // The status changed if either there is no current decision OR the status of the existing decision is different
    let status_changed = decision.map(|d| d.status != status.into()).unwrap_or(true);

    if !need_to_clear_manual_review && !status_changed {
        // The operation is a no-op
        return Ok(None);
    }
    // If a manual review will be cleared or we will create a new decision, the operation
    // is not a no-op and we should create an annotation in the DB
    let annotation = Annotation::create(conn, note, is_pinned, su.id.clone(), actor.clone())?;

    let decision = if status_changed {
        // Create a new decision if the status is different
        let wf_id = workflow_id.clone();
        let new_decision = OnboardingDecisionCreateArgs {
            vault_id: su.vault_id.clone(),
            onboarding: &ob,
            logic_git_hash: crate::GIT_HASH.to_string(),
            result_ids: vec![],
            status: status.into(),
            annotation_id: Some(annotation.0.id),
            actor: DbActor::from(actor.clone()),
            seqno: None,
            workflow_id,
        };
        let decision = OnboardingDecision::create(conn, new_decision)?;
        let update = OnboardingUpdate::set_decision(status.into(), false);
        Onboarding::update(ob, conn, wf_id.as_ref(), update)?;
        Some(decision)
    } else {
        // TODO should create some kind of UserTimeline event here since we are clearing a manual review
        None
    };

    // If there is an outstanding review, creating this override decision clears it
    if let Some(manual_review) = manual_review {
        manual_review.complete(conn, actor, decision.as_ref().map(|d| d.id.clone()))?;
    }

    Ok(decision.map(|d| (d, su)))
}
