use newtypes::{DbActor, ReviewReason, VerificationResultId, WorkflowId};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        scoped_vault::ScopedVault,
        workflow::Workflow,
    },
    TxnPgConn,
};

use super::onboarding::Decision;
use crate::{errors::ApiResult, utils::vault_wrapper::VaultWrapper};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
/// assert_is_first_decision_for_onboarding determines if an error should be thrown if the onboarding already has a decision made
///     we set this true to perform this check during the initial decisioning we make at the end of Bifrost.
///     we also can make decisions post-Bifrost, when we manually trigger a running of decisioning and in those cases we would set this false
#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip(conn))]
pub fn save_final_decision(
    conn: &mut TxnPgConn,
    wf_id: WorkflowId,
    verification_result_ids: Vec<VerificationResultId>,
    decision: &Decision,
    // TODO make this non-null soon
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<OnboardingDecision> {
    // TODO: Create our risk signals!
    // Save status
    let wf = Workflow::lock(conn, &wf_id)?;
    let scoped_user = ScopedVault::get(conn, &wf.scoped_vault_id)?;

    // If we should commit, portablize all data for the onboarding
    let seqno = if decision.should_commit {
        let uvw = VaultWrapper::lock_for_onboarding(conn, &wf.scoped_vault_id)?;
        if uvw.vault.is_portable {
            let seqno = uvw.portablize_identity_data(conn)?;
            Some(seqno)
        } else {
            None
        }
    } else {
        None
    };

    // Create decision
    let onboarding_decision = OnboardingDecisionCreateArgs {
        vault_id: scoped_user.vault_id,
        scoped_vault_id: scoped_user.id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status: decision.decision_status,
        result_ids: verification_result_ids,
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        workflow_id: wf_id.clone(),
    };
    let obd = OnboardingDecision::create(conn, onboarding_decision)?;

    // Create ManualReview row if requested and an active one does not already exist
    if decision.create_manual_review {
        let existing_review = ManualReview::get_active(conn, &wf_id)?;
        if existing_review.is_none() {
            ManualReview::create(conn, review_reasons, wf_id.clone(), wf.scoped_vault_id.clone())?;
        }
    }

    // TODO: Make a billable event here
    // If this is the first time setting a decision, then write decision_made_at
    // This logic is getting convoluted - soon will switch to just workflow update
    let (ob, _) = Onboarding::get(conn, &wf.scoped_vault_id)?;
    let ob = Onboarding::lock(conn, &ob.id)?;
    let update = OnboardingUpdate::set_decision(decision.decision_status, &ob);
    Onboarding::update(ob, conn, Some(&wf_id), update)?;

    Ok(obd)
}
